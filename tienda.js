// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
import TiendaRouter from "./routes/router_tienda.js"     
import UsuariosRouter from "./routes/router_usuarios.js" 
import ProductosRouter from "./routes/router_apiproductos.js"
import ApiBusquedaRouter from "./routes/router_apibusqueda-anticipada.js"
import BusquedaRouter from "./routes/router_busqueda-anticipada.js"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import swaggerUi from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc"	
import connectDB from "./model/connectDB.js"
import cors from "cors"


await connectDB()

const app = express()

app.use(cors()) //deshabilitando todas las request de Cors

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN === 'development',   // true para desarrollo, sin cache
	watch:      IN === 'development',   // reinicio con Ctrl-S
	express: app
})
app.set('view engine', 'html')

app.use('/static', express.static('public'))     // directorio public para archivos css, js, imágenes, etc.

app.use(express.json()); // Middleware para soportar cuerpos JSON
app.use(express.urlencoded({ extended: true })); // Middleware para soportar cuerpos de formularios

//Usamos la cookie antes del middleware de auntenticacion
app.use(cookieParser()) //analizamos las cabeceras de las cookies

// middleware de
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token; //Buscamos en las cookies si existe una llamada 'access_token'
	if (token) { //si existe 
		const data = jwt.verify(token, process.env.SECRET_KEY);  //comrobamos que sea válido
		req.username = data.usuario                               // username en el request
		app.locals.usuario = data.usuario                         // y accesible en las plantillas {{ usuario }}
		app.locals.admin=data.admin								  //admin en el request
	} else {
		app.locals.usuario = undefined //si no hay llamada de acceso no hay ningún usuario.
		app.locals.admin = undefined //no hay administrador
	}
	next()
}

app.use(autentificación); //Aplicamos el middleware de autenticación

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}));


app.use((req, res, next) => { //middleware
	if (!req.session.carrito) {  //Comprueba que no este incializado antes si no siempre será un array vacio
		req.session.carrito=[]
	}
	next() //Para pasar a la siguiente ruta
});

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

app.use("/", TiendaRouter);
app.use("/usuarios", UsuariosRouter); // para los urls que comiencen por /usuarios
app.use("/api/productos", ProductosRouter);
app.use("/api/busqueda-anticipada", ApiBusquedaRouter);
app.use("/busqueda-anticipada", BusquedaRouter);

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// test para las plantillas
app.get("/test", (req, res) => {
  res.render('test.html');
});



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})
