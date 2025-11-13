// ./routes/router_usuarios.js
import express from "express";
import Usuario from "../model/Usuario.js";
import jwt from "jsonwebtoken";

const router = express.Router(); //creamos el router

// Para mostrar formulario de login              --> GET
router.get('/login', (req, res)=>{
	
	res.render("login.html", { error: req.query.error }) // Pasamos el mensaje de error a la plantilla.
})
				
// Para recoger datos del formulario de login    --> POST
router.post('/login', async (req, res)=> {
	
		const user_name=req.body.username
		const user__password=req.body.password
		
		
		const usuario=await Usuario.findOne({username : user_name}) // Usamos findOne para obtener un único documento, no un array.

		
		const password_valida = usuario ? await usuario.isValidPassword(user__password) : false // comprobamos si el usuario es nulo o no, y si no lo es validamos su contraseña

		if(!usuario || !password_valida){ // si el usuario no existe o la contraseña no es válida
			 return res.redirect('/usuarios/login?error=Usuario o contraseña incorrectos') //redirigiumos a la misma página pero con un error
		}
		
		// Si el usuario es válido, su nombre de usuario estará en usuario.username y el admin
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

	const usuario_existente= await Usuario.findOne({$or: [{username : user_name}, {email : user_email}]}) //comprobamos si existe el usuario ya
	if(usuario_existente){ // si existe
		return res.redirect('/usuarios/registro?error=El usuario o el email ya está registrado') // se redirige a la misma página con el error
	}

	const usuario=new Usuario({username: user_name, email: user_email,password: user__password}) //añadimos el usuario

	usuario.save() // encriptamos la contraseña

	res.redirect('/')
})


// Salida
router.get('/logout', (req, res) => {
	// Limpiamos la cookie que contiene el token y luego redirigimos a la portada.
	res.clearCookie('access_token').redirect('/');
})

export default router;