// ./routes/router_usuarios.js
import express from "express";
import Usuario from "../model/Usuario.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Para mostrar formulario de login              --> GET
router.get('/login', (req, res)=>{
	
	res.render("login.html", { error: req.query.error }) // Pasamos el mensaje de error a la plantilla.
})
				
// Para recoger datos del formulario de login    --> POST
router.post('/login', async (req, res)=> {
	
		const user_name=req.body.username
		const user__password=req.body.password
		
		
		const usuario=await Usuario.findOne({username : user_name}) // Usamos findOne para obtener un único documento, no un array.

		
		const password_valida = usuario ? await usuario.isValidPassword(user__password) : false // Ahora 'usuario' es un objeto (o null), por lo que esta llamada es válida.

		if(!usuario || !password_valida){ // si el usuario no existe o la contraseña no es válida
			 return res.redirect('/usuarios/login?error=Usuario o contraseña incorrectos')
		}
		
		// Si el usuario es válido, su nombre de usuario estará en usuario.username
		const token = jwt.sign({usuario: usuario.username, admin:usuario.admin}, process.env.SECRET_KEY)
 
		res.cookie("access_token", token, {            // cookie en el response
			httpOnly: true,
			secure: process.env.IN === 'production'      // en producción, solo con https
		}).redirect("/")
})
				
// Registro
router.get('/registro', (req, res) => {        // --> GET
	res.render("registro.html", { error: req.query.error }); // Pasamos el mensaje de error (si existe) a la plantilla
})
	
router.post('/registro', async (req, res) => {  // --> POST
	const user_name=req.body.username
	const user_email=req.body.email
    const user__password=req.body.password

	const usuario_existente= await Usuario.findOne({$or: [{username : user_name}, {email : user_email}]})
	if(usuario_existente){
		return res.redirect('/usuarios/registro?error=El usuario o el email ya está registrado')
	}

	const usuario=new Usuario({username: user_name, email: user_email,password: user__password})

	usuario.save()

	res.redirect('/')
})


// Salida
router.get('/logout', (req, res) => {
	// Limpiamos la cookie que contiene el token y luego redirigimos a la portada.
	res.clearCookie('access_token').redirect('/');
})

export default router;