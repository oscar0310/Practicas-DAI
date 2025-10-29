// ./routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";
const router = express.Router();
      
// Portada en /
router.get('/', async (req, res)=>{
  try {
    const productos = await Producto.find({})   // todos los productos
		// elegir 3 aquí
    const productos_random=[] //Array de productos random 
    const indices=[]//Array de indices
    //Agregamos tres índices 
    for(let i=0; i<3; i++)
      indices.push(Math.floor(Math.random()*productos.length))
    //Agregamos los tres productos.
    for(let i=0; i<3; i++)
      productos_random.push(productos[indices[i]])
    res.render('portada.html', { productos, productos_random })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message:err.message})
  }
})

// ... más rutas aquí en la siguiente sesión

export default router