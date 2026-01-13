# PRÁCTICA 5.1 DOM, BOTÓN PARA CAMBIAR PRECIOS.

## METODOLOGÍA A SEGUIR:
En esta práctica vamos a implementar el funcionamiento de  un botón en cada card de producto que permita cambiar el precio del producto. Para ello seguiremos los siguientes pasos:
## IDENTICICADORES EN EL HTML 
Primero añadimos a la cards de productos clases para seleccionarlos desde javascript Y cada card dispondrá de un botón.

```html
{% for producto in productos%}
                    <div class="col text-center ">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column">
                                <img src="{{ producto.url_img }}" alt="{{ producto.texto_1 }}">
                                <h3 class="card-title">{{producto.texto_1 }}</h3>
                                <p class="card-text">{{ producto.texto_2}}</p>
                                <div class="mt-auto">
                                    {% if producto.precio_rebajado == 0 %}
                                        <p class="card-text precio_actualizar">{{producto.precio_euros }}€</p>
                                    {% else %}
                                        <p class="card-text text-danger"><del>{{producto.precio_euros }}€</del></p>
                                        <p class="card-text text-success">{{producto.precio_rebajado}}€</p>
                                    {% endif %}
                                    {% if admin %}
                                    <div class="mb-3 cambiar_precio d-flex flex-column align-items-center gap-2">
                                            <input type="number" class="input-precio " placeholder="Nuevo Precio">
                                            <button type="button" class="boton_cambiar_precio btn btn-warning btn-sm ">
                                                Editar Precio
                                            </button>
                                    </div>
                                    {% endif %}
                                    <form class="" action="/al_carrito/" method="GET">
                                        <input type="hidden" class="productoID" name="productoId" value="{{ producto._id}}">
                                        <button type="submit" class="btn btn-success btn-sm ">
                                        Añadir al carrito
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
 {% endfor %}
 ```

## SCRIPT PARA CAMBIAR LOS PRECIOS 

Una vez añadidos los identificadores crearemos en siguiente script para enviar la llamada PUT al API y que actualice el precio. 

EL archivo es **cambiar_precios.js** y  en el se identifica los valores de los inputs , se envía la solicitud PUT al API y se actualiza el valor en la card. El código es el siguiente:

```javascript
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
```

## IMPORTAR EL SCRIPT EN EL HTML
Finalmente importamos el script en el HTML para que se cargue en la página de productos. 

```html
<head>
    <script src="/static/cambio-precio.js" defer></script>
</head>
```