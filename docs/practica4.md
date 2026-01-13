# PRÁCTICA 4 API RESTFUL, LOGGING

## API RESTFUL

La primera parte de la práctica pide que realizemos una **Api Resful** para la colección de productos.
Para ello tenemos que habilitar los siguientes endpoints:

```javascript
GET /api/productos          // todos los productos

GET /api/productos/id       // producto con id

POST /api/productos         // añadir un producto

DELETE /api/productos/id    // eliminar un producto

PUT /api/producto/id        // cambiar el precio de un producto
```
### CREACIÓN DE LOS ENDPOINTS
Para crearlos crearemos un nuevo router en el archivo **router_apiproductos.js** en el estableceremos las siguientes rutas:

-  GET /api/productos &rarr; esta ruta devuelve todos los productos:
```javascript
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
```
- GET /api/productos/id  &rarr; esta ruta devuelve el producto con el id que se le pasa.
```javascript
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
```
- POST /api/productos &rarr; esta ruta añade un producto a la colección:
```javascript       
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
```
- DELETE /api/productos/id &rarr; esta ruta elimina el producto con el id que se le pasa:
```javascript
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
```
- PUT /api/productos/id &rarr; esta ruta cambia el precio del producto con el id que se le pasa:
```javascript
router.put('/:id', async (req, res) => { //ruta para actualizar el precio de un producto por su id
    try {
        const producto = await Producto.findByIdAndUpdate(req.params.id, { //buscamos el producto por su id y actualizamos su precio
            precio_euros: req.body.precio_euros,
            precio_rebajado: req.body.precio_rebajado
        }, { new: true }) //devolvemos el producto actualizado      
        res.send(producto) //devolvemos el producto actualizado
        logger.info(`Se ha actualizado el precio del producto con id: ${producto._id}`)
    }
    catch (err) {
        logger.error(`Error al actualizar el precio del producto con id: ${req.params.id}:
    ${err.message}`)
        res.status(500).send({ message: err.message })
    }
})
```
### INTEGRACIÓN DEL ROUTER EN LA APLICACIÓN
Una vez creados los endpoints, tenemos que integrarlos en la aplicación principal. Para ello, en el archivo **tienda.js** añadimos las siguientes líneas:
```javascript
import ProductosRouter from "./routes/router_apiproductos.js"
app.use(express.json()) //Para que funcione la decodificación de los parámetros que se envian en el body, tendremos que añadir el middleware express.json().
...
app.use('/api/productos', ProductosRouter)
```

### TESTEO DE LA API RESTFUL
Para testear la Api Resful usaremos la extensión de VSCode **REST Client**. Crearemos un archivo llamado **test_api_rest.http** en el que añadiremos las siguientes peticiones:
- GET /api/productos &rarr; devuelve una lista de todos los productos en formato json:
```http
GET http://localhost:8000/api/productos
```
- GET /api/productos/id &rarr; devuelve el producto con el id que se le pasa en formato json:
```http
GET http://localhost:8000/api/productos/id_del_producto
```
- POST /api/productos &rarr; añade un nuevo producto a la colección:
```http
POST http://localhost:8000/api/productos

Content-Type: application/json  
{
     "categoría": "Aguas y refrescos",
     "subcategoría": "Agua", 
     "url_img": "https://prod-mercadona.imgix.net/images/eac424e5ce95dc651fe19e46b0a22d16.jpg?fit=crop&h=300&w=300", 
     "texto_1":"Agua mineral grande Font Natura", 
     "texto_2":"Garrafa 8 L", 
     "texto_precio" : "0.92€/ud ", 
     "precio_euros" : 0.92 , 
     "precio_rebajado" : 0
}
```
- DELETE /api/productos/id &rarr; elimina el producto con el id que se le pasa:
```http
DELETE http://localhost:8000/api/productos/id_del_producto
```
- PUT /api/productos/id &rarr; actualiza el precio del producto con el id que se le pasa:
```http
PUT http://localhost:8000/api/productos/id_del_producto

Content-Type: application/json  
{
     "precio_euros" : 1 ,
     "texto_precio" : "1€/ud "  
}
```
### DOCUMENTACIÓN DE LA API CON SWAGGER
Para documentar la API RESTful usaremos **Swagger**. Primero instalamos las dependencias necesarias:
```bash
npm install swagger-ui-express swagger-jsdoc
```
Luego, en el archivo **tienda.js** añadimos la configuración de Swagger:
```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
...
//Configuración de Swagger 
const swaggerOptions = {
	definition: {
		myapi: '3.0.0',
		info: {
			title: 'API de SUPERMERCADOS OFR',
			version: '1.0.0',
			description: 'Una API encargada de gestionar los procutos',
		},
		servers: [
			{
				url: `http://localhost:${process.env.PORT || 8000}`,
			},
		],
	},
	apis: ['./routes/router_apiproductos.js'], // Apunta al fichero que contiene los endpoints de la API
};
const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```
Finalmente, en el archivo **router_apiproductos.js** añadimos los comentarios necesarios para que Swagger pueda generar la documentación automáticamente, ejemplo de la ruta GET /api/productos :
```javascript
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
```
Para ver la documentación generada, iniciamos la aplicación y accedemos a la URL: `http://localhost:8000/api-docs`

## LOGGER CON WINSTON
Para implementar el logger en la aplicación usaremos la librería **Winston**. Primero instalamos la dependencia:
```bash
npm install winston
```
Luego creamos un archivo llamado **logger.js** en el que configuraremos el logger:
```javascript
import winston from 'winston'; //importamos wiston 
const { combine, timestamp, printf, colorize, align } = winston.format; // importamos herramientas de formato

// Formato para los ficheros de log (sin colores)
const fileFormat = combine(
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A', //Formato de la fecha
    }),
    align(), //alineamos el mensaje
    printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`) //Formato del log
);

// Formato para la consola (con colores)
const consoleFormat = combine(
    colorize({ all: true }), //Coloreamos todo el mensaje
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A', //Formato de la fecha
    }),
    align(), //alineamos el mensaje
    printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`) //Formato del log
);

//Creamos el logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // establecemos si no hay nivel por defecto es info              
    transports: [ 
        new winston.transports.Console({ format: consoleFormat }), //Los mostramos en consola con su formato
        new winston.transports.File({ //Todos los mensajes del log
            filename: 'combined.log',
            format: fileFormat, // Usamos el formato de fichero
        }),
        new winston.transports.File({ //Solo los errores
            filename: 'app-error.log',
            level: 'error',
            format: fileFormat, // Usamos el formato de fichero
        }),
    ],
});

export default logger;
```
Este logger ofrece las siguientes funcionalidades:
- Registra los mensajes de distintos niveles de error en la terminal.
- Registra todos los mensajes en un archivo llamado **combined.log**.
- Registra los mensajes de nivel error en un archivo llamado **app-error.log**.

### INTEGRACIÓN DEL LOGGER EN LA APLICACIÓN
Para integrar el logger en la aplicación, importamos el logger en los archivos donde queramos registrar mensajes y usamos los métodos correspondientes para cada nivel de log. Por ejemplo, en el archivo **router_apiproductos.js**:
```javascript
import logger from '../logger.js'; //importamos el logger
...
logger.info('Mensaje informativo'); //mensaje informativo
logger.error('Mensaje de error'); //mensaje de error
```

