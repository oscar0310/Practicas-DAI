// seed.js
import fs from 'node:fs'

import mongoose from 'mongoose'
	
import connectDB from '../model/connectDB.js'
import Producto from '../model/Producto.js'
	
await connectDB()
	
const datos_productos = Lee_archivo('P1/datos_mercadona.json')
const lista_productos = JSON.parse(datos_productos)
	
await Guardar_en_modelo(Producto, lista_productos)
	
mongoose.connection.close()
		
// https://mongoosejs.com/docs/api/model.html#Model.insertMany()
// devuelve una 'Promise', por tanto asíncrono
	
async function Guardar_en_modelo(modelo, lista) {
	try {
		const insertados = await modelo.insertMany(lista)           // await siempre en funciones async
		console.log(`Insertados ${insertados.length} documentos`)
	} catch (error) {
		console.error(`Error guardando lista ${error.message}`)
	}
}

function Lee_archivo(archivo) {
    try {
        return fs.readFileSync(archivo, 'utf8')
    } catch (error) {
        console.error('Error leyendo archivo: ', error);
    }
}