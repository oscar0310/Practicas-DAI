# PRÁCTICA 7 DESPLIEGUE CON DOCKER COMPOSE:
En esta práctica, aprenderemos a desplegar una aplicación web utilizando Docker Compose. Para ello implementaremos tres servicios:
- La base de datos mongodb.
- La aplicación de tienda.
- El proxy inverso caddy.

## DOCKERIZACIÓN DE LA APLICACIÓN TIENDA:
Para ello vamos a crear un .gitignore para evitar subir todos los archivos innecesarios al repositorio, el mio es el siguiente:
```dockerignore
node_modules 
Dockerfile
.dockerignore
.git
.gitignore
README.md 
docs
frontend
.env
docker-compose*.yml
test-api.http
app-error.log 
combined.log
P1
data/
```
A continuación creamos el Dockerfile para la aplicación tienda:
```Dockerfile
#Usamos una imagen base oficial de Node.js
FROM node:22-alpine AS base

#Cambiamos el directorio de trabaja a /build
WORKDIR /build

#Copiamos los archivos package.json y package-log.json files to the /build directory
COPY package*.json ./

#Instalamos las dependencia de producción y limpiamos a cache
RUN npm ci --omit=dev && npm cache clean --force

#copiamos el resto de los archivos de la apalicación al contenedor
COPY . .

#Exponemos el puerto 8000
EXPOSE 8000

#Definimos el comando para iniciar la aplicación
CMD ["node", "tienda.js"]
```
### PREVIO AL DOCKER COMPOSE 
ANtes de crear el docker compose nos tenemos que encargar de que se pueda conectar la aplicación con la base de datos. Creamos una variable de entorno y cambiamos la cadena de conexión en el archivo connectDB.js, esta será DB_HOST, ya que en desarrollo es el localhost, pero en producción es el contendor:
```javascript
// ./model/connectDB.js
import mongoose from "mongoose";
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS
const DB_HOST = process.env.DB_HOST

const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/DAI?authSource=admin`
	
export default async function connectDB() {            // export default
	try {
		await mongoose.connect(url);                   // await siempre dentro de funciones async
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
	
	const dbConnection = mongoose.connection;
	dbConnection.once("open", (_) => {                  // callback, con función flecha
		console.log(`Database connected: ${url}`);
	});
			 
	dbConnection.on("error", (err) => {                 // callback, con función flecha
		console.error(`connection error: ${err}`);
	});
	return;
}
```
También para que funcione tenemos que encargarnos de en la configuración de vite, tenemos que añadir:
```javascript
base: '/public/react/',
```
en el archivo vite.config.js, para que las rutas de los recursos sean correctas. Ya que en producción la aplicación no se sirve desde la raíz.

Para finalizar, tenemos que construir el front end de react para producción, para ello ejecutamos:
```
npm run build 
```
Esto creará una carpeta dist dentro de frontend, que es la que usaremos en producción y se la pasaremos a caddy para que sirva el frontend.

Una vez hecho esto, ya podemos crear el docker compose.

## DOCKER COMPOSE: 
Aquí es donde orquestamos los tres servicios que vamos a utilizar:
```docker-compose.yml
services:
  #contenedor de la tienda
  tienda-dai:
    build: . #lo construimos a partir del Dockerfile que hemos hecho de la aplicación
    depends_on: #depende de la base de datos
      - mongo
    restart: unless-stopped
    environment: #declaramos las variables de entorno
      - IN=production
      - USER_DB=${USER_DB}
      - PASS=${PASS}
      - SECRET_KEY=${SECRET_KEY}
      - DB_HOST=mongo
  #contenedor de la base de datos
  mongo:
    image: mongo:noble #imagen de mongo
    restart: unless-stopped 
    volumes:
      - ./data:/data/db #obtenemos los datos de la carpeta data
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${USER_DB} #variables para identificarse en la bd
      MONGO_INITDB_ROOT_PASSWORD: ${PASS}
  #contenedor del proxy inverso
  caddy:
    image: caddy:alpine #usamos la imagen de caddy
    depends_on:
      - tienda-dai #depende dela aplicación de la tienda
    restart: unless-stopped
    ports:
      - 8000:80 
    volumes:
      - caddy-config:/config
      - caddy-data:/data
      - ./Caddyfile:/etc/caddy/Caddyfile #archivo de configuracion
      - ./public:/usr/share/caddy/public #le pasamos los archivos estaticos
      - ./frontend/dist:/usr/share/caddy/public/react #rl front end en la carpeta dist
volumes:
  caddy-config:
  caddy-data:
```