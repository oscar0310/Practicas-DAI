// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
import logger from "../logger.js";

const router = express.Router();

// Portada en /
router.get('/', async (req, res) => {
  try {
    const busqueda = req.query.busqueda; //Valor pasado con get de búsqueda.
    if (busqueda) { // si tiene algún valor 
      const productosEncontrados = await Producto.find({ texto_1: { $regex: busqueda, $options: 'i' } })// Se buscan todos los productos relacionados con la busqueda
      res.render('portada.html', { productos: productosEncontrados }) // se pasa a portada.html
      if (productosEncontrados) {
        logger.info(`Se ha relizado una busqueda con valor: ${busqueda}`)
      }
    }
    else {
      const productos = await Producto.find({})   // todos los productos
      // elegir 3 aquí
      let productos_random = [] //Array de productos random 
      let indices = []//Array de indices
      //Agregamos índices 
      for (let i = 0; i < 15; i++) {
        let control = true
        while (control == true) { //Comprobamos que no se repita
          let indice = Math.floor(Math.random() * productos.length)
          if (indices.includes(indice) == false) {
            indices.push(indice)
            control = false
          }
        }
      }

      //Agregamos los productos.
      for (let i = 0; i < indices.length; i++)
        productos_random.push(productos[indices[i]])
      res.render('portada.html', { productos: productos_random })    // ../views/portada.html, 
      logger.info(`Mostrando la portada`)
    }
  } catch (err) {                                // se le pasa { productos:productos }
    logger.error(`Error al mostrar los productos : ${err}`)
    res.status(500).send({ message: err.message })
  }
})

// ... más rutas aquí en la siguiente sesión
router.get('/al_carrito/', async (req, res) => {
  try {
    const producto = req.query.productoId;  //Recibimos el id del producto
    req.session.carrito.push(producto); //Lo añadimos al array carrito de session
    let productosCarrito = []; //Nos declaramos un array para guardar los productos del carrito
    let precioTotal = 0; // Precio total

    for (let i = 0; i < req.session.carrito.length; i++) // Con los id añadimos los productos a nuestro array
      productosCarrito.push(await Producto.findById({ _id: req.session.carrito[i] })); //Usamos findById como se recomienda en el guión

    //Calculamos el precio total
    for (let i = 0; i < productosCarrito.length; i++)
      if (productosCarrito[i].precio_rebajado > 0) //SDI el precio esta rebajado se usa este
        precioTotal += productosCarrito[i].precio_rebajado
      else
        precioTotal += productosCarrito[i].precio_euros
    precioTotal = precioTotal.toFixed(2)   // Aproximamos a las centesimas

    //Para que no se quede vacía mostramos productos aleatorios
    const productos = await Producto.find({}); // todos los productos
    let productos_random = []; //Array de productos random
    let indices = []; //Array de indices
    //Agregamos índices
    for (let i = 0; i < 15; i++) {
      let control = true;
      while (control == true) { //COmprobamos que no se repitan
        let indice = Math.floor(Math.random() * productos.length);
        if (indices.includes(indice) == false) {
          indices.push(indice);
          control = false;
        }
      }
    }
    //Agregamos los productos.
    for (let i = 0; i < indices.length; i++)
      productos_random.push(productos[indices[i]])
    //Pasamos a portada los productos aleatorios, el total de productos y el precio total
    res.render("portada.html", {
      productos: productos_random,
      totalProductos: productosCarrito.length,
      precioTotal
    });

    logger.info(`Se ha añadido un producto al carrito con id: ${producto}`)
  }
  catch (err) {
    logger.error(`Error al añadir un producto al carrito : ${err}`)
    res.status(500).send({ message: err.message })
  }


})

export default router