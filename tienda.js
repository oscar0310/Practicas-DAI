// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
import TiendaRouter from "./routes/router_tienda.js"     
import UsuariosRouter from "./routes/router_usuarios.js" 
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import connectDB from "./model/connectDB.js"
await connectDB()

const app = express()

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
app.use(cookieParser())

// middleware de
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token;
	if (token) {
		const data = jwt.verify(token, process.env.SECRET_KEY);
		req.username = data.usuario                               // username en el request
		app.locals.usuario = data.usuario                         // y accesible en las plantillas {{ usuario }}
	} else {
		app.locals.usuario = undefined
	}
	next()
}

app.use(autentificación) //Aplicamos el middleware de autenticación

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))


app.use((req, res, next) => { //middleware
	if (!req.session.carrito) {  //Comprueba que no este incializado antes si no siempre será un array vacio
		req.session.carrito=[]
	}
	next() //Para pasar a la siguiente ruta
});

app.use("/", TiendaRouter);
app.use("/usuarios", UsuariosRouter); // para los urls que comiencen por /usuarios

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
