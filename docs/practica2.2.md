# TIENDA ON-LINE BÚSQUEDAS Y MÁS

Como bien dice el título lo que vamos a implementar en este apartado son las búsquedas, mediante el método get, mejorararemos el css del framework Bootstrap de los productos y añadiremos un campo nuevo a la base de datos que es precio rebajado.

## BÚSQUEDAS

Para las búsquedas usaremosd el método GET, obtendremos del url la cadena a buscar en la base de datos y devolveremos la búsqueda.
Para ello lo primero que he hecho ha sido añadir un formulario a la barra de navegación de **portada.html** que será para buscar:

```html
<form action="/" method="GET">
  <input
    class="form-control"
    type="text"
    id="busqueda"
    name="busqueda"
    placeholder="Busca sus productos..."
  />
  <button type="submit" class="btn btn-secondary">Buscar</button>
</form>
```

El formulario es un campo para rellenar con texto y un botón que lo envía a la url.

Esta información que es enviada la vamos a procesar en el **router_tienda.js**

En la ruta que teníamos en la **P2.1** le he añadido algunas modificaciones:

Dentro de :

```javascript
outer.get("/", async (req, res) => {
  //Código
});
```

Primero he declarado una variable busqueda y recogemos el valor que se envía con GET.

```javascript
const busqueda = req.query.busqueda;
```

Después evaluamos si busqueda tiene algún valor, si tiene se devuelve los productos relacionados con la búsqueda

```javascript
if (busqueda) {
  // si tiene algún valor
  const productosEncontrados = await Producto.find({
    texto_1: { $regex: busqueda, $options: "i" },
  }); // Se buscan todos los productos relacionados con la busqueda
  res.render("portada.html", { productos: productosEncontrados }); // se pasa a portada.html
}
```//Agregamo

Si no mostramos los productos aleatorios:

```javascript
else{ // Si no hay nada que buscar
    const productos = await Producto.find({})   // todos los productos
    // elegir 3 aquí
    let productos_random=[] //Array de productos random
    let indices=[]//Array de indices
    //Agregamos índices
    for(let i=0; i<15; i++){ 
        let control=true
        while(control==true){ //Controlamos que no se repitan
          let indice=Math.floor(Math.random()*productos.length)
          if(indices.includes(indice)==false){
            indices.push(indice)
            control=false
          }
        }
    }

    //Agregamos los productos.
    for(let i=0; i<indices.length; i++)
        productos_random.push(productos[indices[i]])
    
    res.render('portada.html', { productos : productos_random })    // ../views/portada.html,
}
```
Y ya se mostrarían en portada.html de la misma forma que se mostraban los productos aleatorios en la otra práctica.

## APARIENCIA
De cara a mejorar la apariencia para que se parezca más a los "cards" del mercadona le hemos aplicado los siguientes cambios:

```javascript
 <section class="container-fluid border"> <!-- Los hacemos que sean contenedores fluidos -->
                <div class="row"><!--Organizados por filas -->
                    {% for producto_random in productos_random %}
                    <div class="col text-center "><!-- Cada columna  tiene el texto en el centro-->
                        <div class="card h-100"><!-- Cada producto son cartas con una altura fija-->
                            <div class="card-body"><!-- el cuerpo de la carta -->
                                <img src="{{ producto_random.url_img }}" alt="{{ producto_random.texto_1 }}">
                                <h3 class="card-title">{{ <!--Titulo de la carta -->
                                    producto_random.texto_1 }}</h3>
                                <p class="card-text">{{ producto_random.texto_2}}</p> <!-- Texto de la carta  -->
                                {% if producto_random.precio_rebajado == 0 %}
                                    <p class="card-text">{{producto_random.precio_euros }}€</p>
                                {% else %}
                                    <p class="card-text text-danger"><del>{{producto_random.precio_euros }}€</del></p> <!-- Texto en rojo -->
                                    <p class="card-text text-success">{{producto_random.precio_rebajado}}€</p> <!-- Texto en verde-->
                                {% endif %}
                            </div>
                        </div>
                    </div>
                    {% endfor %}
                </div>
 </section>
```
## PRECIO REBAJADO
Para añadir el campo rebajado, he editado **Producto.js** y he añadido precio_rebajado: 
```javascript
precio_rebajado: {
	type: Number,
	required: false,
	default: 0,
	trim: true
}
```
Es de tipo numero, no es requerido, el valor por defecto es cero y se eliminan los espacios en blanco.

Para actualizarlo eliminé todos los datos de la base de datos a traves de la **web de Mongo express** en http://localhost:8081/ y posteriormente inserté toda la información de nuevo con **seed.js** de la P1.

Para editar el campo desde la web: 

![Imagen editar](/public/editar.png)
Pulsamos el botón azul.

Y editamos el valor de precio_rebajado y lo guardamos:
![Imagen editor](/public/precio_rebajado.png)

Una vez hecho esto, lo que haremos es encarganos de modificar la portada.html para que cuando el precio esté rebajado, se muestre el precio anterior en rojo tachado y el precio nuevo en verde:
``` html
{% if producto_random.precio_rebajado == 0 %}
    <p class="card-text">{{producto_random.precio_euros }}€</p>
{% else %}
    <p class="card-text text-danger"><del>{{producto_random.precio_euros }}€</del></p>
    <p class="card-text text-success">{{producto_random.precio_rebajado}}€</p>
{% endif %}
```
Y con esto estaría terminada la **práctica 2.2**.