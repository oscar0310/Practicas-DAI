// public/busqueda-anticipada.js
// 1. Seleccionamos los elementos del DOM
const inputBusqueda = document.getElementById('input-busqueda');
const resultadoTexto = document.getElementById('resultado-texto');
const contenedorTarjetas = document.getElementById('tarjetas');

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
});

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
