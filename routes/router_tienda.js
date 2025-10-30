// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();
      
// Portada en /
router.get('/', async (req, res)=>{
  try {
    const busqueda =req.query.busqueda;
    if(busqueda){
      const productosEncontrados = await Producto.find({texto_1: {$regex: busqueda, $options: 'i'}})
      res.render('portada.html', {productos : productosEncontrados} )
    }
    else{
      const productos = await Producto.find({})   // todos los productos
      // elegir 3 aquí
      let productos_random=[] //Array de productos random 
      let indices=[]//Array de indices
      //Agregamos tres índices 
      for(let i=0; i<15; i++){
        let control=true
        while(control==true){
          let indice=Math.floor(Math.random()*productos.length)
          if(indices.includes(indice)==false){
            indices.push(indice)
            control=false
          }
        } 
      }
        
      //Agregamos los tres productos.
      for(let i=0; i<indices.length; i++)
        productos_random.push(productos[indices[i]])
      res.render('portada.html', { productos : productos_random })    // ../views/portada.html, 
    }
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message:err.message})
  }
})

// ... más rutas aquí en la siguiente sesión
router.get('/al_carrito/', async (req, res)=>{
  const producto = req.query.productoId;
  req.session.carrito.push(producto);
  let productosCarrito = [];
  let precioTotal = 0;

  for (let i = 0; i < req.session.carrito.length; i++)
    productosCarrito.push(await Producto.findById({ _id: req.session.carrito[i] }));
  

  for (let i = 0; i < productosCarrito.length; i++)
    if (productosCarrito[i].precio_rebajado > 0)
      precioTotal += productosCarrito[i].precio_rebajado
    else 
      precioTotal +=productosCarrito[i].precio_euros
  precioTotal=precioTotal.toFixed(2)   
  const productos = await Producto.find({}); // todos los productos
  // elegir 3 aquí
  let productos_random = []; //Array de productos random
  let indices = []; //Array de indices
  //Agregamos tres índices
  for (let i = 0; i < 15; i++) {
    let control = true;
    while (control == true) {
      let indice = Math.floor(Math.random() * productos.length);
      if (indices.includes(indice) == false) {
        indices.push(indice);
        control = false;
      }
    }
  }
  //Agregamos los tres productos.
  for(let i=0; i<indices.length; i++)
    productos_random.push(productos[indices[i]])
  res.render("portada.html", {
    productos: productos_random,
    totalProductos: productosCarrito.length,
    precioTotal,
  });
})

export default router