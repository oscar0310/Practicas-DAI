# PRÁCTICA 2.1 TIENDA ON-LINE CON EXPRESS, NUNJUCK Y MONGOOSE

Para esta práctica hemos comenzado con los cimientos de una aplicación web MPA para nuestra tienda online, se ha  usado el famoso framework Express, el motor de plantilla Nunjucks, el ODM mongoose para interaccionar con la bd y para añadirle un poco más de visibilidad el framework de css Bootstrap.

Nuestro repositorio donde estará todo el código de la aplicación web se verá así:

![Estructura Repositorio](../public/estructurarepo.png)

## package.json 
Lo primero que haremos es cambiar **package.json**  añadiendo una linea para que el servidor se reinicie solo cada vez que se cambia el código:

```javascript
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env tienda.js",
  }
```
se le indica que en el archivo oculto **.env** se pondrán las variables de entorno y con la opción **-watch** es la encargada del reinicio del servidor.

Para iniciar la aplicación se usa:
```javascript
npm run dev
```
¡Solo iniciar cuando esté implementado **tienda.js**!

## Archivo .env
Es una malísima idea que aparezca la **contraseña en el código**, por tanto las añadiremos al archivo **.env** junto con otras variables de entorno que podemos utilizar. **No se sube a github**

```javascript
USER_DB=root
PASS=example
IN=development
```
Ahora lo añadiremos al **docker-compose.yml**:
```yaml
# docker-compose.yml
services:
  mongo:
    image: mongo:noble
    restart: unless-stopped
    volumes:
      - ./data:/data/db
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${USER_DB}
      MONGO_INITDB_ROOT_PASSWORD: ${PASS}

  mongo-express:
    image: mongo-express
    depends_on:
      - mongo
    restart: unless-stopped
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${USER_DB}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${PASS}
      ME_CONFIG_MONGODB_URL: mongodb://${USER_DB}:${PASS}@mongo:27017/
      ME_CONFIG_BASICAUTH: false
```
Y ahora en **connectDB.js**:
```javascript
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017/DAI?authSource=admin`	
```
## Motor de plantillas 
De cara a la generación de páginas html que se mandan de vuelta al navegador con cada request, usaremos **nunjucks** como ya se menciono actualmente, esto nos servirá para inbsertar los datos en los html procedientes de la BD.

Para instalarlo usaremos:
```javascript
npm i nunjucks chokidar
```
**chokidar**: sirve para el reinicio de las plantillas cada vez que se haga un cambio en el código y se guarde.

## Servidor 

Para implementar el servidor usaremos tienda.js
```javascript
// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
      
import connectDB from "./model/connectDB.js"
await connectDB()

const app = express()

const IN = process.env.IN || 'development' //desarrollo

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN === 'development',   // true para desarrollo, sin cache
	watch:      IN === 'development',   // reinicio con Ctrl-S
	express: app
})
app.set('view engine', 'html')

app.use('/static', express.static('public'))     // directorio public para archivos css, js, imágenes, etc.
app.use("/", TiendaRouter);

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// test para las plantillas
app.get("/test", (req, res) => {
  res.render('test.html');
});

//Hace que se escuhe a traves del puerto 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})
``` 

## Router
Se encarga de pasarle  la información al servidor. Creamos un **router_tienda.js** en el directorio routes.

```javascript
// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();
      
// Portada en /
router.get('/', async (req, res)=>{
  try {
    const productos = await Producto.find({})   // todos los productos
		// elegir 3 aquí
    res.render('portada.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({err.message})
  }
})

// ... más rutas aquí en la siguiente sesión

export default router
```

Par que funcione hay que añadir a **tienda.js** esto para realizar la conexión:
```javascript
import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);
```

Quedando **tienda.js** tal que así:
```javascript
// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
import TiendaRouter from "./routes/router_tienda.js"      
import connectDB from "./model/connectDB.js"
await connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN === 'development',   // true para desarrollo, sin cache
	watch:      IN === 'development',   // reinicio con Ctrl-S
	express: app
})
app.set('view engine', 'html')

app.use('/static', express.static('public'))     // directorio public para archivos css, js, imágenes, etc.
app.use("/", TiendaRouter);

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// test para las plantillas
app.get("/test", (req, res) => {
  res.render('test.html');
});

//Para que se escuche el servidor por el puerto 800
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})
```

## Elegir tres productos al azar y mostrarlos:
De cara a obtener nota se propone elegir tres productos al azar, haciendo primero una consulta oara averiguar el númerom de productos y luego elegir tres de ellos aleatoriamente.

Para esto primero nos vamos a ir a **router_tienda.js** que es el encargado de pasar la información al servidor.

En él vamos  a crear la lógica para escoger los tres productos aleatorios y monstrarlos:

Ya venía un array con todos los productos que se pide en esta línea de código:

```javascript
const productos = await Producto.find({})   // todos los productos
```
Luego yo me he creado dos arrays auxiliares uno para los productos random y otro para los índices de esos productos en el array anterior:

```javascript
const productos_random=[] //Array de productos random 
const indices=[]//Array de indices
```
De cara a obtener los índices, lo que hacemos es añadir tres números aleatorios al array de índices, primero con **Math.random()** generamos un número entre 0 y 1 , esto lo múltiplicamos por la cantidad de productos que hay **productos.lenght**  asegurandonos de que esté en el rango de productos y por último redondeamos para que sea una cifra exacta con **Math.floor**. 

```javascript
//Agregamos tres índices 
    for(let i=0; i<3; i++)
      indices.push(Math.floor(Math.random()*productos.length))
```
Una vez obtenidos los ídices los usamos copiando esos tres producto del array de productos al vector de productos aletorios:
```javascript
//Agregamos los tres productos.
    for(let i=0; i<3; i++)
      productos_random.push(productos[indices[i]])
```
Para terminar nos aseguramos que este array se pasa al servidor:
```javascript
 res.render('portada.html', { productos, productos_random })  
```

Con esto **router_tienda.js** se quedaría tal que así:

```javascript
// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();
      
// Portada en /
router.get('/', async (req, res)=>{
  try {
    const productos = await Producto.find({})   // todos los productos
		// elegir 3 aquí
    const productos_random=[] //Array de productos random 
    const indices=[]//Array de indices
    //Agregamos tres índices 
    for(let i=0; i<3; i++)
      indices.push(Math.floor(Math.random()*productos.length))
    //Agregamos los tres productos.
    for(let i=0; i<3; i++)
      productos_random.push(productos[indices[i]])
    res.render('portada.html', { productos, productos_random })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message:err.message})
  }
})

// ... más rutas aquí en la siguiente sesión

export default router
```

Una vez tenemos esto nos iremos a **portada.html** y crearemos un html simple donde recorreremos los productos random y los mostraremos, nos ayudaremos de **Nunjucks** de cara a recorrer el array productos_random y lo mostraremos por pantalla:

```html
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <title>Supermercado</title>
    <body>
        <main>
            {% for producto_random in productos_random %}
                <img src="{{ producto_random.url_img }}" alt="{{ producto_random.texto_1 }}">
                <h3>{{ producto_random.texto_1 }}</h3>
                <p>{{ producto_random.texto_2 }}</p>
                <p>{{ producto_random.precio_euros }}€</p>
            {% endfor %}              
        </main>
    </body>
</html>
```
De cara a darle visibilidad he usado el framework de **css Bootstrap**, le he añadido los siguientes cambios parta mejorar la apariencia de la web siguiendo el [tutorial](https://www.tutorialrepublic.com/twitter-bootstrap-tutorial/) que había en swap:

- Primero para que funcione he añadido el link de **Bootstrap** al **head**:

```html
<link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
            crossorigin="anonymous">
```
- Con la intencvión de darle una apariencia a una web más real, le añadí una barra navegadora en verde, con el nombre del supermercado  y al lado links a futuras secciones de categorías, listas, identifacarse, el carrito:
```html
<nav class="navbar navbar-expand-lg bg-success navbar-dark">
            <div class="container-fluid">

                <h1 href="#" class="navbar-brand">Supermercado OFR</h1>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav">
                        <a href="#" class="nav-item nav-link active">Categorías</a>
                        <a href="#" class="nav-item nav-link">Listas</a>
                    </div>
                    <div class="navbar-nav ms-auto">
                        <a href="#" class="nav-item nav-link">Identifícate</a>
                        <a href="#" class="nav-item nav-link">Carrito</a>
                    </div>
                </div>
            </div>
        </nav>
```
- En cuanto para mejorar como se muestran los productos los he metido en un  contenedor que se adapta a los bordes, y  los he mostrado por columnas en una misma fila.
```html
<section class="container-fluid border">
                <div class="row">
                    {% for producto_random in productos_random %}
                    <div class="col border text-center ">
                        <img src="{{ producto_random.url_img }}" alt="{{ producto_random.texto_1 }}">
                        <h3>{{ producto_random.texto_1 }}</h3>
                        <p>{{ producto_random.texto_2 }}</p>
                        <p>{{ producto_random.precio_euros }}€</p>
                    </div>
                    {% endfor %}
                </div>
            </section>
```

El archivo completo quedaría tal que:
```html
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <title>Supermercado</title>
        <!-- Bootstrap CSS -->
        <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
            crossorigin="anonymous">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg bg-success navbar-dark">
            <div class="container-fluid">

                <h1 href="#" class="navbar-brand">Supermercado OFR</h1>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav">
                        <a href="#" class="nav-item nav-link active">Categorías</a>
                        <a href="#" class="nav-item nav-link">Listas</a>
                    </div>
                    <div class="navbar-nav ms-auto">
                        <a href="#" class="nav-item nav-link">Identifícate</a>
                        <a href="#" class="nav-item nav-link">Carrito</a>
                    </div>
                </div>
            </div>
        </nav>
        <main>
            <section class="container-fluid border">
                <div class="row">
                    {% for producto_random in productos_random %}
                    <div class="col border text-center ">
                        <img src="{{ producto_random.url_img }}" alt="{{ producto_random.texto_1 }}">
                        <h3>{{ producto_random.texto_1 }}</h3>
                        <p>{{ producto_random.texto_2 }}</p>
                        <p>{{ producto_random.precio_euros }}€</p>
                    </div>
                    {% endfor %}
                </div>
            </section>
        </main>
    </body>

</html>
```