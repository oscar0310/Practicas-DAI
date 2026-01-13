# PRÁCTICA 5.3: DOM , TARJETAS.
En esta práctica complementaremos la búsuqeda anticipada realizada en la práctica 5.2 mostrando los productos encontrados en tarjetas usando TailwindCSS. Para ello seguiremos los siguientes pasos:

## TARJETAS CON TAILWINDCSS
Crearemos las tarjetas en el archivo **busqueda-anticipada.html** dentro del contenedor de tarjetas. El código de las tarjetas es el siguiente:

```html
<template id="plantilla">
        <div class="max-w-sm rounded overflow-hidden w-full sm:w-64 hover:shadow border border-rounded">
            <img class="img_producto w-10/12 h-3/6 bg-gray-400 ml-5"
                 src="" 
                 alt="">
            <div class="px-6 py-4">
                <div class="nombre_producto mb-2 text-sm"></div>
                <div class="descripcion_producto text-gray-600 text-xs mb-2 h-12 overflow-hidden"></div>
                <p class="precio_producto text-gray-700 text-base"></p>
            </div>
            <div class="px-6 pb-2 text-center">
                <span class="w-full inline-block rounded-full px-3 py-1 text-sm text-yellow-800 mr-2 mb-2 
                             border border-yellow-600 hover:bg-yellow-200">
                    Añadir al carro
                </span>
            </div>
        </div>
</template>
```
Y este template lo clonaremos desde el script de búsqueda anticipada para cada producto encontrado y lo importaremos en el main de la página.

```javascript
<main class="flex flex-col items-center mt-32">
        <h2 id="resultado-texto" class="text-3xl font-normal text-gray-800"> </h2>
        <div id="tarjetas" class="flex flex-wrap justify-center gap-4"></div>
</main>
```

## MODIFICACIONES EN EL SCRIPT DE BÚSQUEDA ANTICIPADA
Ahora modificaremos el script de búsqueda anticipada para que por cada producto encontrado clone el template de la tarjeta, rellene los datos y lo añada al contenedor de tarjetas. Para ello añadiremos la función **muestraProducto(producto)** que se encargará de realizar estas tareas. El código modificado del script es el siguiente:

```javascript
function muestraProducto(p) {  								// para cada producto p
	const template = document.getElementById('plantilla')	// la plantilla
	const clonado = template.content.cloneNode(true)        // se clona

	// substituir en clonado la información del producto p.img_url, p.texto_1, etc
    const img=clonado.querySelector('.img_producto'); //obtenemos donde se ubica la imagen 
    img.src=p.url_img; //cambiamos el url de la imagen en la plantilla
    img.alt=p.texto_1; //cambiamos el alt de la imagen en la plantilla

    const texto1=clonado.querySelector('.nombre_producto'); //obtenemos donde se ubica el nombre del producto
    texto1.textContent=p.texto_1; //cambiamos el nombre del producto en la plantilla

    const texto2=clonado.querySelector('.descripcion_producto'); //obtenemos donde se ubica la descripcion del producto
    texto2.textContent=p.texto_2; //cambiamos la descripción del producto en la plantilla

    const precio=clonado.querySelector('.precio_producto'); //obtenemos donde se ubica el precio del producto
    precio.textContent=`Precio: ${p.precio_euros} €`; //cambiamos el precio del producto en la plantilla

	// tarjetas es el nodo de la página donde se mostrarán las tarjetas
	const tarjetas = document.getElementById('tarjetas')	 //obtenemos la plantilla de las tarjetas
	tarjetas.append(clonado) //se clona
}
```
Y en la parte donde se procesan los resultados de la búsqueda llamaremos a esta función para cada producto encontrado:
```javascript
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

            // Limpiamos tarjetas anteriores
             contenedorTarjetas.innerHTML = '';

            //Mostramos los productos en tarjetas
            for(p of productos){
                muestraProducto(p);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultadoTexto.textContent = 'Hubo un error al realizar la búsqueda';
        });
```

Este script estaba ya importado en la página **busqueda-anticipada.html** para que funcione correctamente.
```html<script src="/static/busqueda-anticipada.js" defer></script>
```