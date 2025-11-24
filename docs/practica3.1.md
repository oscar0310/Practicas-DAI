# PRÁCTICA 3.1 AUNTENTICACIÓN CON JWT

En esta práctica hemos añadidio a la web de la tienda la autentificación de usuarios y en el caso de que no esten registrados el registro. 

## MODELO PARA USUARIOS
Para ello lo primero que hice fue declarar un nuevo modelos de usuarios **usuario.js** con la siguiente forma:

```javascript
mport mongoose from 'mongoose';
import bcrypt from 'bcrypt';

//Creamos un esquema de usuario
const usuarioSchema = new mongoose.Schema({
    username: {
        type: String, //String
        required: true, //requerida
        trim: true // sin espacios en blanco
    },
    email: {
        type: String, //String
        required: true, //requerida
        unique: true, //única
        lowercase: true //Se convierte en minúscula
    },
    password: {
        type: String, //String
        required: true, //requerida
        minlength: 6 //una longitud de  6
    },
    createdAt: {
        type: Date, //Fecha
        default: Date.now //Valor de la fecha actual
    }
});

//Método de encriptación de la contraseña
usuarioSchema.pre('save', async function(next){
        try{
            //Comprueba si la contraseña ha sido modificada
            if(!this.isModified('password')) return next();

            //generamos un salt y hasheamos la contraseña
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);

            next();
        } catch (error){
            next(error);
        }
});

//Método para validar la contraseña
usuarioSchema.methods.isValidPassword = async function(password){
    try {
        //Comparamos la contraseña con la contraseña hasheada
        return await bcrypt.compare(password, this.password)
    } catch (error){
        throw new Error('Password comparison failed');
    }
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario; 
```
El modelo viene con dos funciones una que se encarga de encriptar las contraseñas en la base de datos, gran error de seguridad no encriptarlas y otro que comprueba si la contraseña que le pasan es igual a la contraseña guardada.

## MIDDLEWARE DE AUNTENTICACIÓN 

Una vez creado el modelo, cree un midleware en el servidor que nos ayudará a saber el usuario que está en la sesión, para esto usaremos un request que comprueba una cookie, y en caso de que exicta añadiremos la información al token.

```javascript
// tienda.js 
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
...
app.use(cookieParser()) //analizamos las cabeceras de las cookies
 
// middleware de
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token; //Buscamos en las cookies si existe una llamada 'access_token'
	if (token) { //si existe 
		const data = jwt.verify(token, process.env.SECRET_KEY);  //comrobamos que sea válido
		req.username = data.usuario                               // username en el request
		app.locals.usuario = data.usuario                         // y accesible en las plantillas {{ usuario }}
	} else {
		app.locals.usuario = undefined //si no hay llamada de acceso no hay ningún usuario.
	}
	next()
}
app.use(autentificación) //Aplicamos el middleware de autenticación
```

## RUTAS DE IDENTIFICACIÓN Y REGISTRO

Para el login y el registro hemos creado un nuevo router, llamado **router_tienda.js**, en el se han establecido todas las rutas necesarias para este apartado.

Para comenzar hemos incluido:

```javascript
import express from "express";
import Usuario from "../model/Usuario.js";
import jwt from "jsonwebtoken";
```
Y hemos creado el router:

```javascript
const router = express.Router(); //creamos el router
``` 

Lo siguiente que hemos definido ha sido la ruta **/login** encargada del login. para ello para mostrar el formulario usamos:
```javascript
// Para mostrar formulario de login              --> GET
router.get('/login', (req, res)=>{
	res.render("login.html", { error: req.query.error }) // Pasamos el mensaje de error a la plantilla.
})
```
Y para obtener los valores del formulario y crear la cookie del usuario hemos hecho:
```javascript
// Para recoger datos del formulario de login    --> POST
router.post('/login', async (req, res)=> {
	
		const user_name=req.body.username
		const user__password=req.body.password
		
		
		const usuario=await Usuario.findOne({username : user_name}) // Usamos findOne para obtener un único documento, no un array.

		
		const password_valida = usuario ? await usuario.isValidPassword(user__password) : false // comprobamos si el usuario es nulo o no, y si no lo es validamos su contraseña

		if(!usuario || !password_valida){ // si el usuario no existe o la contraseña no es válida
			 return res.redirect('/usuarios/login?error=Usuario o contraseña incorrectos') //redirigiumos a la misma página pero con un error
		}
		
		// Si el usuario es válido, su nombre de usuario estará en usuario.username
		const token = jwt.sign({usuario: usuario.username}, process.env.SECRET_KEY)
 
		res.cookie("access_token", token, {            // cookie en el response
			httpOnly: true,
			secure: process.env.IN === 'production'      // en producción, solo con https
		}).redirect("/") //redirigimos a la web original
})
``` 
Para mostrar el formulario de registro usamos la ruta **/registro**:
```javascript
// Registro
router.get('/registro', (req, res) => {        // --> GET
	res.render("registro.html", { error: req.query.error }); // Pasamos el mensaje de error (si existe) a la plantilla
})

``` 
Y obtenemos los datos del formulario con:
```javascript
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
``` 
Para terminar hice un **/logout** para cerrar la sesion.
```javascript
// Salida
router.get('/logout', (req, res) => {
	// Limpiamos la cookie que contiene el token y luego redirigimos a la portada.
	res.clearCookie('access_token').redirect('/');
})
```
Y se exporta el router
```javascript
export default router;
```

Para poder usar estas rutas hay que definirlas en el servidor:
```javascript
// tienda.js 
...
import UsuariosRouter from "./routes/router_usuario.js"
app.use("/usuarios", UsuariosRouter); // para urls que comienzen por /usuarios
```

## FORMULARIOS DE LOGIN Y REGISTRO
Para obtener los datos he creado dos formularios muy parecidos uno encargado del registro y otro del login, ambos tienen puesta como se valida con bootstrap

### FORMULARIO LOGIN:
Este formulario nos pide el nombre y contraseña.
```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8" />
    <title>Login</title>
    <link rel="icon" type="image/png" href="/static/avatar.png" />
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous" />
    <style>
        body {
            min-height: 100vh;
            /*Para centrarlo*/
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #198754;
        }

        section {
            max-width: 800px;
            margin: auto;
        }
    </style>
</head>

<body>
    <main class="container">
        <section class="card-group">
            <div class="card">
                <div class="card-body justify-content-center align-items-center">
                    <img src="/static/logo.png" class="img-fluid" alt="Logo Supermercado" />
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title text-center mb-4">Iniciar
                        Sesión</h2>
                    <form action="/usuarios/login" method="POST" class="needs-validation" novalidate> <!--formulario POST con action ruta login, usa bootstrap para las validaciones por eso lo de novalidate-->
                        <div class="mb-3">
                            <label class="form-label">Nombre de
                                Usuario:</label>
                            <input type="text" id="username" name="username" class="form-control"
                                placeholder="Introduce su nombre de usuario" required />
                            <div class="invalid-feedback"> <!--Validación Bootstrap-->
                                Por favor escriba su Nombre de Usuario.
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña:</label>
                            <input type="password" id="password" name="password" class="form-control"
                                placeholder="Introduce su contraseña" required />
                            <div class="invalid-feedback">  <!--Validación Bootstrap-->
                                Por favor escriba su contraseña.
                            </div>
                        </div>
                        <div class="mb-3 text-center">
                            <p class="card-text">
                                No estás registrado:
                                <a href="/usuarios/registro">Registro.</a> <!-- enlace a registro-->
                            </p>
                        </div>
                        {% if error %} <!--si  hay algún error lo muestra-->
                        <div class="alert-warning text-danger text-center mb-2">
                            <p>{{ error }}</p>
                        </div>
                        {% endif %}
                        <div class="d-grid">
                            <input type="submit" value="Iniciar Sesión" class="btn btn-success" />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    </main>
    <script>
        //Script de la documentación de bootstrap para validar
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (() => {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.needs-validation')

            // Loop over them and prevent submission
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', event => {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }

                    form.classList.add('was-validated')
                }, false)
            })
        })()
    </script>
</body>

</html>
```
### FORMULARIO REGISTRO
EN este formulario se nos pide nombre, email y contraseña, como en el anterior usamos la validación Bootstrap.
```javascript
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Login</title>
    <link rel="icon" type="image/png" href="/static/avatar.png" />
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <style>
        body {
            /*Para centrarlo*/
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #198754;
        }

        section {
            max-width: 800px;
            margin: auto;
        }
    </style>
</head>

<body>
    <main class="container">
        <section class="card-group">
            <div class="card">
                <div class="card-body justify-content-center align-items-center">
                    <img src="/static/logo.png" class="img-fluid" alt="Logo Supermercado" />
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title text-center mb-4">Registro</h2>
                    <form action="/usuarios/registro" method="POST" class="needs-validation" novalidate><!--formulario POST con action ruta registro, usa bootstrap para las validaciones por eso lo de novalidate-->
                        <div class="mb-3">
                            <label class="form-label">Nombre de usuario:</label>
                            <input type="text" id="username" name="username" class="form-control"
                                placeholder="Introduce su nombre de usuario" required />
                            <div class="invalid-feedback"> <!--Validación Bootstrap-->
                                Por favor escriba un nombre de usuario.
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Email:</label>
                            <input type="email" id="email" name="email" class="form-control"
                                placeholder="Introduce su email" required />
                            <div class="invalid-feedback"> <!--Validación Bootstrap-->
                                Por favor escriba un email.
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña:</label>
                            <input type="password" id="password" name="password" class="form-control"
                                placeholder="Introduce su contraseña" required />
                            <div class="invalid-feedback"> <!--Validación Bootstrap-->
                                Por favor escriba una contraseña.
                            </div>
                        </div>
                </div>
                {% if error %} <!--si  hay algún error lo muestra-->
                <div class="alert-warning text-danger text-center mb-2">
                    <p>{{ error }}</p>
                </div>
                {% endif %}
                <div class="d-grid">
                    <input type="submit" value="Registrarse" class="btn btn-success" />
                </div>
                </form>
            </div>
            </div>
        </section>
    </main>
    <script>
        //Script de la documentación de bootstrap para validar
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (() => {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.needs-validation')

            // Loop over them and prevent submission
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', event => {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }

                    form.classList.add('was-validated')
                }, false)
            })
        })()
    </script>

</body>

</html>
```
## CAMBIOS EN PORTADA.HTML

De cara al funcionamiento de login, una vez iniciado se sepa quien eres y se pueda salir de la sesión he añadido al navegador de la portada lo siguiente :
```html
                        {% if usuario %}
                            <a href="#" class="nav-item nav-link active">{{ usuario }}</a>
                            <a href="/usuarios/logout" class="nav-item nav-link active">Salir</a>
                        {% else %}
                            <a href="/usuarios/login" class="nav-item nav-link active">Identifícate</a>
                        {% endif %}

```
Y con esto terminaría esta práctica