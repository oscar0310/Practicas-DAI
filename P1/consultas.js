import mongoose from 'mongoose'
  
import connectDB from '../model/connectDB.js'
import Producto from '../model/Producto.js'
    
await connectDB()

//Para mostrar todo
//const all = await Producto.find();
//console.log(all)

//Productos menos de un euro
const menos1=await Producto.find({ precio_euros: { $lt : 1}})
console.log('Productos menos de 1€: ', menos1)

//Productos menos de un euro y que no sean agua
const menos1na=await Producto.find({$and : [ { precio_euros: { $lt : 1}}, { subcategoria: { $not: /Agua/ }} ]})
console.log('Productos menos de 1€ y que no sean agua: ', menos1na)

//Productos que son aceite y ordenados por precio de menor a mayor( valor 1) , si fuera al reves ( valor -1)
const aceitesORD= await Producto.find({texto_1: /Aceite/}).sort({ precio_euros : 1})
console.log('Aceites ordenados de menor a mayor precio: ', aceitesORD)

//Productos que son garrafas
const garrafas=await Producto.find({texto_2 : /Garrafa/})
console.log('Productos que son garrafa: ', garrafas)

mongoose.connection.close()
