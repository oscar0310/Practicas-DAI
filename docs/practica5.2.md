# PRÁCTICA 5.2: DOM, BÚSQUEDA ANTICIPADA CON TAILWINDCSS.

En esta práctica vamos a implementar una búqueda anticipada, para ello haremos una página usando tailwindcss que permita buscar productos a medida que el usuario escribe en un campo de texto. Para ello seguiremos los siguientes pasos:

## API 
Primero crearemos un endpoint en el API que permita buscar productos por texto. Este endpoint recibirá un parámetro de búsqueda y devolverá los productos que coincidan con el texto.

```javascript
// ./routes/router_apibusqueda-anticipada.js
import express from "express";
import Producto from "../model/Producto.js";

const router = express.Router();

router.get('/', async (req, res)=>{
  try {
    const productos = await Producto.find({})   // todos los productos
		// elegir 3 aquí
    res.render('busqueda-anticipada.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message : err.message})
  }
})


export default router; 
```
Importaremos este router al servidor **tienda.js** y lo asociaremos a la ruta **/api/busqueda-anticipada/**

```javascript
// tienda.js
import ApiBusquedaRouter from "./routes/router_apibusqueda-anticipada.js"

app.use('/api/busqueda-anticipada/', ApiBusquedaRouter);
``` 
Una vez hecho esto ya tenemos el endpoint que nos devolverá los productos.

## PÁGINA DE BÚSQUEDA ANTICIPADA
Ahora crearemos la página de búsqueda anticipada. Para ello primero instalaremos la extension de vscode de [TailwindCSS](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) y para que se active tendremos que crear un arcchivo de configuración **taildwind.config.js**.

Ahora crearemos la gina con el siguiente html, **busqueda-anticipada.html**:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />    
    <title>Búsqueda anticipada</title>
    <link rel="icon" type="image/png" href="/static/favicon.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    <script src="/static/busqueda-anticipada.js" defer></script>
</head>
<body class="font-sans text-gray-600">

    <header class="flex items-center justify-between px-8 py-3 bg-white shadow-sm gap-4">
        
        <div class="flex items-baseline gap-4 min-w-fit">
            <h1 class="text-2xl font-bold text-gray-700 tracking-tight">Tienda DAI</h1>
            <span class="text-gray-500 text-sm hidden md:block">Busqueda anticipada</span>
        </div>

        <div class="flex-grow max-w-3xl mx-4">
            <div class="relative w-full">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass text-gray-500"></i>
                </div>
                
                <input 
                    type="text" 
                    id="input-busqueda"
                    class="w-full py-2.5 pl-12 pr-4 text-gray-800 bg-gray-50 border-2 border-green-500 rounded-full focus:outline-none focus:bg-white transition-colors" 
                    placeholder="Buscar productos..."
                    autocomplete="off"
                >
            </div>
        </div>

        <div class="flex items-center gap-6 text-sm font-medium min-w-fit">
            <a href="#" class="hover:text-green-600 transition-colors">Categorías</a>
            <a href="#" class="hover:text-green-600 transition-colors">Listas</a>
            
            <a href="#" class="hover:text-green-600 transition-colors flex items-center gap-1">
                Identifícate 
                <i class="fa-solid fa-chevron-down text-xs"></i>
            </a>
            
            <a href="#" class="hover:text-green-600 transition-colors flex items-center gap-2">
               Carrito <i class="fa-solid fa-cart-shopping text-xl"></i>
            </a>
        </div>
    </header>

    <main class="flex flex-col items-center mt-32">
        <h2 id="resultado-texto" class="text-3xl font-normal text-gray-800"> </h2>
    </main>
</body>
</html>
```
En el main tenemos un título donde monstraremos los resultados de la búsqueda.

## SCRIPT DE BÚSQUEDA ANTICIPADA
Ahora crearemos el script que realizará la búsqueda anticipada. Este script escuchará los eventos de teclado en el input de búsqueda, realizará una llamada al API y actualizará el contenido del main con los resultados obtenidos. El código es el siguiente:

```javascript
/ public/busqueda-anticipada.js
// 1. Seleccionamos los elementos del DOM
const inputBusqueda = document.getElementById('input-busqueda');
const resultadoTexto = document.getElementById('resultado-texto');

// 2. Agregamos el "escuchador" de eventos
// 'input' se dispara cada vez que el usuario escribe o borra un carácter
inputBusqueda.addEventListener('input', (event) => {

    // Obtenemos el texto y quitamos espacios al inicio/final
    const termino = event.target.value.trim();

    // Lógica de 3 caracteres
    if (termino.length < 3) {
        resultadoTexto.textContent = ''; // Limpiamos si es muy corto
        return;
    }

    // 3. Llamada al API (Fetch)
    // Asegúrate de que la ruta coincida con tu router de express (/api/busqueda-anticipada/)
    fetch(`/api/busqueda-anticipada/${termino}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(productos => {
            // 4. Actualizamos el HTML con la respuesta
            if (productos.length > 0) {
                resultadoTexto.textContent = `Encontrados ${productos.length} productos`;
            } else {
                resultadoTexto.textContent = `No se encontraron productos que contengan "${termino}"`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultadoTexto.textContent = 'Hubo un error al realizar la búsqueda';
        });
});
```
Este script enemos que importarlo en la página **busqueda-anticipada.html** para que funcione correctamente.
```html
<script src="/static/busqueda-anticipada.js" defer></script>
```