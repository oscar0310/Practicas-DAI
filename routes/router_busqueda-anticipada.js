// ./routes/router_apibusqueda-anticipada.js
import express from "express";
import Producto from "../model/Producto.js";

const router = express.Router();

router.get('/', async (req, res)=>{
  try {
    const productos = await Producto.find({})   // todos los productos
		// elegir 3 aquí
    res.render('busqueda-anticipada.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message : err.message})
  }
})


export default router; 