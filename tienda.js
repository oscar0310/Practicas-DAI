// tienda.js 
import express   from "express"
import nunjucks  from "nunjucks"
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