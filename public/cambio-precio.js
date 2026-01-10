//cambio-precio.js
const cambiar_precio = (evt) => {
    const boton = evt.target;

    //identificar a que producto pertenece
   const id = boton.closest('.mt-auto').querySelector('.productoID').value; //obtenemos el id del producto

    //identificar el <input> que le corresponde
    const inputPrecio = boton.closest('.cambiar_precio').querySelector('.input-precio'); //Busca el input del elemento padre 
    

    //tomar el valor de entrada del input
    const nuevoPrecio=inputPrecio.value; //toma el valor del input

    fetch(`/api/productos/${id}`, { // Ajusta la URL según tu API
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({precio_euros: nuevoPrecio})
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
        //poner precio actualizado
        const parrafoPrecio=boton.closest('.mt-auto').querySelector('.precio_actualizar'); //buscamos el texcto del precio en elelemento padre
        parrafoPrecio.textContent=`${nuevoPrecio}€`;  //Actualizamos el precio en el párrafo
        
    })
    .catch(err=> {
        console.error(err)
        //poner mensaje de error
        alert('Error al actualizar el precio');

    })
}

//Sacar los botones _cambiar_precio aquí
const botones_cambiar_precio = document.querySelectorAll('.boton_cambiar_precio');

for(const botón of botones_cambiar_precio){
    botón.addEventListener('click', cambiar_precio)
}
