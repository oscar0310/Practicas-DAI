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
      res.render('portada.html', {productos_random: productosEncontrados} )
    }
    else{
      const productos = await Producto.find({})   // todos los productos
      // elegir 3 aquí
      let productos_random=[] //Array de productos random 
      let indices=[]//Array de indices
      //Agregamos tres índices 
      for(let i=0; i<12; i++){
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
      res.render('portada.html', { productos, productos_random })    // ../views/portada.html, 
    }
  } catch (err) {                                // se le pasa { productos:productos }
	console.error(err)
    res.status(500).send({message:err.message})
  }
})

// ... más rutas aquí en la siguiente sesión

export default router