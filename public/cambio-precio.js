//cambio-precio.js
const cambiar_precio = (evt) => {
    const botón = evt.target;

    //identificar a que producto pertenece
    const id = botón.dataset.productoId; // Obtiene el ID del atributo data-producto-id

    //identificar el <input> que le corresponde
    const input = botón.parentElement.querySelector('.input-precio');

    //tomar el valor de entrada del input
    const entrada_del_input = input.value;

    fetch(`/api/productos/${id}`, { // Ajusta la URL según tu API
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({precio_euros: entrada_del_input})
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
        //poner el precio actualizado
        const contenedor = botón.closest('.mt-auto');
        const textoPrecio = contenedor.querySelector('p.card-text'); // Elemento donde se muestra el precio
        if (textoPrecio) {
            const delTag = textoPrecio.querySelector('del');
            if (delTag) {
                delTag.textContent = `${entrada_del_input}€`;
            } else {
                textoPrecio.textContent = `${entrada_del_input}€`;
            }
        }
        alert("Precio actualizado correctamente");
    })
    .catch(err=> {
        console.error(err)
        //poner mensaje de error
        alert("Error al actualizar el precio");
    })
}

//Sacar los botones _cambiar_precio aquí
const botones_cambiar_precio = document.querySelectorAll('.boton_cambiar_precio'); // Selecciona todos los botones

for(const botón of botones_cambiar_precio){
    botón.addEventListener('click', cambiar_precio)
}
