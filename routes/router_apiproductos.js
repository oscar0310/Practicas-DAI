// ./routes/router_apiproductos.js
import express from "express";
import Producto from "../model/Producto.js";
import logger from "../logger.js";

const router = express.Router()

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene una lista de todos los productos
 *     responses:
 *       200:
 *         description: Una lista de productos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: El ID autogenerado del producto.
 *                   categoría:
 *                     type: string
 *                     description: La categoría del producto.
 *                   subcategoría:
 *                     type: string
 *                     description: La subcategoría del producto.
 *                   url_img:
 *                     type: string
 *                     description: URL de la imagen del producto.
 *                   texto_1:
 *                     type: string
 *                     description: Nombre o texto principal del producto.
 *                   texto_2:
 *                     type: string
 *                     description: Descripción secundaria del producto.
 *                   texto_precio:
 *                     type: string
 *                     description: Texto que acompaña al precio.
 *                   precio_euros:
 *                     type: number
 *                     description: El precio del producto en euros.
 *                   precio_rebajado:
 *                     type: number
 *                     description: El precio rebajado del producto (0 si no aplica).
 *       500: 
 *         description: Error al obtener todos los productos
 */
router.get('/', async (req, res) => {  //ruta que obtiene todos los productos
    try {
        const productos = await Producto.find({}) //los copia
        res.send(productos) //los devuelve
        logger.info('Se ha mostrado todos los productos')
    }
    catch (err) {
        logger.error(`Error al obtener todos los productos: ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: El ID del producto a obtener.
 *     responses:
 *       200:
 *         description: Datos del producto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 categoría:
 *                   type: string
 *                 subcategoría:
 *                   type: string
 *                 url_img:
 *                   type: string
 *                 texto_1:
 *                   type: string
 *                 texto_2:
 *                   type: string
 *                 texto_precio:
 *                   type: string
 *                 precio_euros:
 *                   type: number
 *                 precio_rebajado:
 *                   type: number
 *       500:
 *         description: Error al obtener el producto con ese id.
 */
router.get('/:id', async (req, res) => { //ruta para obtener un producto por su id
    try {
        const producto = await Producto.findById(req.params.id);//busca el producto por su id
        res.send(producto); //lo devuelve si lo encuentra
        logger.info(`Se devuelve el producto: ${producto.texto_1} con id: ${producto._id} `)
    }
    catch (err) {
        logger.error(`Error al obtener el producto con id: ${req.params.id}: ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoría:
 *                 type: string
 *               subcategoría:
 *                 type: string
 *               url_img:
 *                 type: string
 *               texto_1:
 *                 type: string
 *               texto_2:
 *                 type: string
 *               texto_precio:
 *                 type: string
 *               precio_euros:
 *                 type: number
 *               precio_rebajado:
 *                 type: number
 *     responses:
 *       200:
 *         description: El producto fue creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error al añadir el producto.
 */
router.post('/', async (req, res) => { //ruta para crear un nuevo producto
    try {
        const producto = new Producto({ //el producto
            categoría: req.body.categoría,
            subcategoría: req.body.subcategoría,
            url_img: req.body.url_img,
            texto_1: req.body.texto_1,
            texto_2: req.body.texto_2,
            texto_precio: req.body.texto_precio,
            precio_euros: req.body.precio_euros,
            precio_rebajado: req.body.precio_rebajado
        })

        await producto.save(); //lo guardamos
        res.send(producto); //devolvemos el nuevo producto
        logger.info(`Se ha añadido el producto: ${producto.texto_1} con id: ${producto._id}`);
    }
    catch (err) {
        logger.error(`Error al añadir el producto: ${err.message}`);
        res.status(500).send({ message: err.message })
    }
})

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina un producto por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: El ID del producto a eliminar.
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente.
 *       500:
 *         description: No hay ningún producto con ese id
 */
router.delete('/:id', async (req, res) => { //eliminamos un producto por su id
    try {
        await Producto.findByIdAndDelete(req.params.id) //buscamos el producto por su id y lo borramos
        res.send('Producto eliminado')
        logger.info(`Se ha eliminado el producto con id: ${req.params.id}`)
    }
    catch (err) {
        logger.error(`No hay ningún producto con ese id ${req.params.id}: ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza el precio de un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: El ID del producto a actualizar.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precio_euros:
 *                 type: number
 *               texto_precio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/:id', async (req, res) => { //Cambiamos el precio de un producto del cual se pasa su id
    try {
        const texto_precio =  `${req.body.precio_euros} €`; //Creamos el texto del precio
        const producto = await Producto.findByIdAndUpdate(req.params.id, { precio_euros: req.body.precio_euros, texto_precio: texto_precio}, { new: true }) //Actualizamos su precio
        res.send(producto)
        logger.info(`Se ha cambiado correctamente el precio del producto: ${producto.texto_1} con id: ${producto._id} a ${producto.texto_precio}`)
    }
    catch (err) {
        logger.error(`No se puede cambiar el precio al producto con id ${req.params.id}: ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})

export default router;  