# PRÁCTICA 2.2 TIENDA ON-LINE: CARRITO

Para esta sesión vamos ha hacer funcionar el botón **Añadir al carro**, los productos que se añadan serán guardados usando sesiones las cuales son guardado hasta que se cierra la sesión.

Para esto lo primero que harémos es instalar **session de Express**

```javascript
npm i express-session
```

Lo primero añadiremos las credenciales de la sesion en **tienda.js** y creará la sesión

```javascript
app.use(
  session({
    secret: "my-secret", // a secret string used to sign the session ID cookie
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
```

De cara a mantener la información he declarado un array que contendrá los id de los productos añadidos a la cesta, en un middleware que comprueba que no ha sido declarado antes y si no es así lo declara. Para que no se queda estancado ahí uso next() para que salte a la siguiente ruta.

```javascript
app.use((req, res, next) => {
  //middleware
  if (!req.session.carrito) {
    //Comprueba que no este incializado antes si no siempre será un array vacio
    req.session.carrito = [];
  }
  next(); //Para pasar a la siguiente ruta
});
```

En esta práctica se pide que el carrito se actualice el nº de productos y el precio total, parab ello en **router_tienda.js** nos declaramos la siguiente ruta,

```javascript
router.get("/al_carrito/", async (req, res) => {
  const producto = req.query.productoId; //Recibimos el id del producto
  req.session.carrito.push(producto); //Lo añadimos al array carrito de session
  let productosCarrito = []; //Nos declaramos un array para guardar los productos del carrito
  let precioTotal = 0; // Precio total

  for (
    let i = 0;
    i < req.session.carrito.length;
    i++ // Con los id añadimos los productos a nuestro array
  )
    productosCarrito.push(
      await Producto.findById({ _id: req.session.carrito[i] })
    ); //Usamos findById como se recomienda en el guión

  //Calculamos el precio total
  for (let i = 0; i < productosCarrito.length; i++)
    if (productosCarrito[i].precio_rebajado > 0)
      //SDI el precio esta rebajado se usa este
      precioTotal += productosCarrito[i].precio_rebajado;
    else precioTotal += productosCarrito[i].precio_euros;
  precioTotal = precioTotal.toFixed(2); // Aproximamos a las centesimas

  //Para que no se quede vacía mostramos productos aleatorios
  const productos = await Producto.find({}); // todos los productos
  let productos_random = []; //Array de productos random
  let indices = []; //Array de indices
  //Agregamos índices
  for (let i = 0; i < 15; i++) {
    let control = true;
    while (control == true) {
      //COmprobamos que no se repitan
      let indice = Math.floor(Math.random() * productos.length);
      if (indices.includes(indice) == false) {
        indices.push(indice);
        control = false;
      }
    }
  }
  //Agregamos los productos.
  for (let i = 0; i < indices.length; i++)
    productos_random.push(productos[indices[i]]);
  //Pasamos a portada los productos aleatorios, el total de productos y el precio total
  res.render("portada.html", {
    productos: productos_random,
    totalProductos: productosCarrito.length,
    precioTotal,
  });
});
```

De cara a recibir los id de cada producto lo que he vuelto ha hacer es otro formulario, con un calpo oculto que es el id y se pasa con get al pulsar el boton a la ruta /al_carrito/:

```html
<form class="" action="/al_carrito/" method="GET">
  <input type="hidden" name="productoId" value="{{ producto._id}}" />
  <button type="submit" class="btn btn-success btn-sm ">
    Añadir al carrito
  </button>
</form>
```

Para mostrar los datos pasados con la ruta al campo carrito que tenia en la barra de navegación le he añadido dos Badges uno con el nº de productos y otro con el precio total, tal que así.

```html
<a href="#" class="nav-item nav-link active">
  Carrito
  <span class="badge text-bg-primary rounded-circle bg-danger">{{ totalProductos }}</span>
  {% if precioTotal %}
    <span class="bottom-0 text-bg-secondary ">{{ precioTotal }}€ </span>
  {% endif %}
</a>
```
