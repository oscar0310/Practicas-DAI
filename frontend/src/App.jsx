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
