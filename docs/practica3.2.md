# PRÁCTICA 3.2 AUTORIZACIÓN

En esta práctica vamos a establecer el role de admin entre los usuarios y vamos a añadir un botón para cambiar los precios solo los admin. Este botón será sin funcionalida la cual se implementará más adelante.

## ROLE DE ADMIN

Para esto lo primero que hemos hecho es variar el esquema de admin, creando un atributo admin que por defecto este en falso:

```javascript
 admin: {
        type: Boolean,
        default: false,
        required: false
    },
```

Y para que funcione bien en el midleware tenemos que añadir admin:

```javascript
// middleware de
const autentificación = (req, res, next) => {
  const token = req.cookies.access_token; //Buscamos en las cookies si existe una llamada 'access_token'
  if (token) {
    //si existe
    const data = jwt.verify(token, process.env.SECRET_KEY); //comrobamos que sea válido
    req.username = data.usuario; // username en el request
    app.locals.usuario = data.usuario; // y accesible en las plantillas {{ usuario }}
    app.locals.admin = data.admin; //admin en el request
  } else {
    app.locals.usuario = undefined; //si no hay llamada de acceso no hay ningún usuario.
    app.locals.admin = undefined; //no hay administrador
  }
  next();
};
```

Y en el login añadimnos los permisos de admin al token JWT:

```javascript
// Si el usuario es válido, su nombre de usuario estará en usuario.username y el admin
const token = jwt.sign(
  { usuario: usuario.username, admin: usuario.admin },
  process.env.SECRET_KEY
);
```

Con esto ya tendríamos la parte de comprobar si es admin o no

## BOTÓN DE CAMBIOS PARA EL PRECIO

Aquí añadiremos un botón a cada artículo para comprobar si es admin o no, para ello en portada.html hemos añadido:

```html
{% if admin %}
<form class="mb-3" action=" " method="GET">
  <button type="submit" class="btn btn-warning btn-sm  ">Editar Precio</button>
</form>
{% endif %}
```
Y con esto estaría terminada la P3.2.
