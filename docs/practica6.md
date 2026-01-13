# PRÁCTICA 6 - FRONT END CON REACT
En esta sesión haremos un front end con React para la búsqued anticipada reutilizando el código HTML usado en la práctica 5.

## DESACTIVAR ELCORS EN EL SERVIDOR 

Tenemos que habilitar las llamadas desde un navegador de un puerto distinto al servidor para ello primero instalamos cors en el servidor::
> npm install cors

Y lo siguiente editaremos **tienda.js** :
```javascript
import cors from "cors"

app.use(cors())
```
Con esto ya tendríamos el servidor listo para aceptar peticiones desde el front end.

## CREAR EL FRONT END CON REACT
 Para ello crearemos una carpeta frontend  con vite: 
 >npm create vite@latest frontend

 Esto saltará una configuración tendremos que elegir react y javascript.

 Una vez elegida tendremos que acceder a la carpeta e instalar tailwindcss y tailwindcss/vite:
 >npm install tailwindcss @tailwindcss/vite

 Una vez instalado esto, tendrémos que importar  el plugin en **vite.config.js** :
 ```javascript
 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

Ahora eliminaremos de **App.css** y **index.css** todo el contenido y importaremos tailwindcss en ambos archivos:
```css
@import "tailwindcss";
```
Una vez hecho esto podemos comprobar que todo esta correcto con:
>npm run dev

## COMPONENTE PRINCIPAL :
Este es el componente App.jsx que contendrá el buscador y el componente de resultados:
```javascript
import { useState } from 'react'
import Navegacion from "./components/Navegacion"
import Resultados from "./components/Resultados"

function App() {
  const [busqueda, setBusqueda] = useState('') //Estado: aquí guardamos lo que escribe el usuario, busqueda valor actual y setBusqueda la función para cambiar el valor

  const handleInput = (evt) => { //Manejador: se ejecuta cada vez que alguien escriba en el input
    const value = evt.target.value
    // comprobar que funciona
    console.log(value)
    setBusqueda(value) //Actualizamos el estado
  }

  //Devolvemos la función para que nos avise al escribir
  // y el texto que estamos buscando
  return (
    <>
      <Navegacion onInput={handleInput} /> 
      <Resultados de={busqueda} />
    </>
  )
}

export default App
```
Con esta lógica lo que hacemos es que lo que se teclee en Navegación se le pasa al componente resultados.

## COMPONENTE NAVEGACIÓN
Este componente contendrá la barra de navegación con el input de búsqueda para ello reusaremos el header de **busqueda-anticipada.html** de la Práctica 5 pero haciendo unas pequeñas modificaciones para que funcione con React, como son cambiando class por className y añadiendo el manejador onInput al input de búsqueda:
```javascript
//./components/Navegacion.jsx
export default function Navegacion({ onInput }) {
    return ( // Devuelve la barra de navegación
        <header className="flex items-center justify-between px-8 py-3 bg-white shadow-sm gap-4">

            <div className="flex items-baseline gap-4 min-w-fit">
                <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Tienda DAI</h1>
                <span className="text-gray-500 text-sm hidden md:block">Busqueda anticipada</span>
            </div>

            <div className="flex-grow max-w-3xl mx-4">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <i className="fa-solid fa-magnifying-glass text-gray-500"></i>
                    </div>

                    <input
                        type="text"
                        id="input-busqueda"
                        className="w-full py-2.5 pl-12 pr-4 text-gray-800 bg-gray-50 border-2 border-green-500 rounded-full focus:outline-none focus:bg-white transition-colors"
                        placeholder="Buscar productos..."
                        autocomplete="off"
                        onInput={onInput} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium min-w-fit">
                <a href="#" className="hover:text-green-600 transition-colors">Categorías</a>
                <a href="#" className="hover:text-green-600 transition-colors">Listas</a>

                <a href="#" className="hover:text-green-600 transition-colors flex items-center gap-1">
                    Identifícate
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                </a>

                <a href="#" className="hover:text-green-600 transition-colors flex items-center gap-2">
                    Carrito <i className="fa-solid fa-cart-shopping text-xl"></i>
                </a>
            </div>
        </header>
    )
}
```

## COMPONENTE RESULTADOS:
Este componente se encargará de mostrar los resultados de la búsqueda. Reutilizaremos el código HTML de las tarjetas de producto de la Práctica 5 pero adaptándolo a React y haciendo una llamada al servidor a la api de búsqueda anticipada  para obtener los productos que coincidan con la búsqueda.

Primero tenemos que instalar el hook swr para hacer las peticiones:
>npm install swr.

Una vez hecho esto comenzamos con el componente:

- Importamos swr y creamos una función fetcher para capturar las respuestas de la API:
```javascript
// ./components/Resultados.jsx 
import useSWR from 'swr';

//definimos un fetcher 
const fetcher = (...args) => fetch(...args).then(res => res.json())
```

Ahora creamos la función que mostrará los resultados:
```javascript
export default function Resultados({ de }) {

    //Se comprueba que al menos se escriban 3 caracteres
    if (de.length < 3) return <div className="w-full text-center text-3x1 font-bold text-gray-500 mt-10"> al menos 3 caractéres </div>

    //Función que se encarga de los productos
    const ponProductos = (productos) => {
        if (!productos || productos.length === 0) return <div className="w-full text-center text-3x1 font-bold text-gray-500 mt-10" >No se encontraron productos.</div>; //verificamos que haya productos de ese tipo

        return (
            <div id="tarjetas" className="flex flex-wrap justify-center gap-4">
                {productos.map((producto) => (
                    <div key={producto._id} className="max-w-sm rounded overflow-hidden w-full sm:w-64 hover:shadow border border-rounded">
                        <img className="img_producto w-10/12 h-3/6 bg-gray-400 ml-5"
                            src={producto.url_img}
                            alt={producto.texto_1}/>
                            <div className="px-6 py-4">
                                <div className="nombre_producto mb-2 text-sm">{producto.texto_1}</div>
                                <div className="descripcion_producto text-gray-600 text-xs mb-2 h-12 overflow-hidden">{producto.texto_2}</div>
                                <p className="precio_producto text-gray-700 text-base">{producto.texto_precio}</p>
                            </div>
                            <div className="px-6 pb-2 text-center">
                                <span className="w-full inline-block rounded-full px-3 py-1 text-sm text-yellow-800 mr-2 mb-2 
                             border border-yellow-600 hover:bg-yellow-200">
                                    Añadir al carro
                                </span>
                            </div>
                    </div>
                ))}
            </div>
        )

    }
    // hook de swr, re-rendiriza en algún cambio de las variables
    const { data, error, isLoading } = useSWR(
        `http://localhost:8000/api/busqueda-anticipada/${de}`,
        fetcher
    );

    return (
        <div>
            {
                isLoading ? (
                    <h1>Cargando</h1>
                ) : data ? (
                    ponProductos(data)
                ) : error ? (<div>{error}</div>) : (<div>...</div>)
            }
        </div>
    )
}
```

Esta función comprueba que se han escrito al menos 3 caracteres, si no es así muestra un mensaje. Luego hace la llamada a la API con swr y muestra los productos obtenidos usando la función ponProductos que mapea los productos obtenidos y los muestra en tarjetas reutilizando el código HTML de la práctica 5. Hay que tener en cuenta que en las tarjetas de los productos se una .map que es necesario en React para iterar sobre listas y que cada elemento debe tener una key única (en este caso usamos el _id del producto).