// ./routes/router_apibusqueda-anticipada.js
import express from "express";
import logger from "../logger.js";
import Producto from "../model/Producto.js";


const router = express.Router();

router.get('/:busqueda', async (req, res) => { //ruta para obtener lo buscado
    try {
        const productos = await Producto.find({ texto_1: { $regex: req.params.busqueda, $options: 'i' } });//busca todos los productos relacionados con lo que se busca
        res.send(productos); //Devuelve todos los productos encontrados
        logger.info(`Se devuelve los prductos de la busqueda:${req.params.busqueda}`)
    }
    catch (err) {
        logger.error(`Error al obtener el los productos relacionados con ${req.params.busqueda}: ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})

export default router; 