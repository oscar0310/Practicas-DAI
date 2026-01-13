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
