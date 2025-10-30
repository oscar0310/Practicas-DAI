// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
import TiendaRouter from "./routes/router_tienda.js"      
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

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))


app.use((req, res, next) => {
	if (!req.session.carrito) {
		req.session.carrito=[]
	}

	next()
});



app.use("/", TiendaRouter);

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

