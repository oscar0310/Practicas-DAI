# PRÁCTICA 1.2 POBLACIÓN INICIAL Y CONSULTAS EN LA BASE DE DATOS
Para esta práctica hemos utilizado los datos conseguidos con el parser y los hemos alamacenado en la base de datos, usando mongoose en lugar de los driver de mongodb.
 
Primero hemos creado la carpeta model, donde se guardará todo el código relacionado con la base de datos, en esta carpeta hemos guardado los siguientes archivos:

- connectDB.js, este script contiene el código para conectarse a la base de datos:
```javascript
    import mongoose from "mongoose";

    const url = `mongodb://root:example@localhost:27017/DAI?authSource=admin`
        
    export default async function connectDB() {            // export default
        try {
            await mongoose.connect(url);                   // await siempre dentro de funciones async
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        }
        
        const dbConnection = mongoose.connection; 
        dbConnection.once("open", (_) => {                  // callback, con función flecha
            console.log(`Database connected: ${url}`);
        });
                
        dbConnection.on("error", (err) => {                 // callback, con función flecha
            console.error(`connection error: ${err}`);
        });
        return;
    }
```
- Producto.js, contiene un esquema para validar los datos antes de entrar en la base de datos

```javascript
    import mongoose from 'mongoose';

    const productoSchema = new mongoose.Schema({
        categoría: {
            type: String,
            required: true,
            trim: true,   // Removes whitespace
        },
        subcategoría: {
            type: String,
            required: true,
            trim: true,
        },		
        url_img: {
            type: String,
            required: true,
            trim: true,
        },
        texto_1: {
            type: String,
            required: true,
            trim: true,
        },
        texto_2: {
            type: String,
            required: true,
            trim: true,
        },
        texto_precio: {
            type: String,
            required: true,
            trim: true,
        },
        precio_euros: {
            type: Number,
            required: true,
            trim: true,
        }
    })
    const Producto = mongoose.model('Producto', productoSchema);
    export default Producto
```
Fuera de model se crea el programa principal seed.js, que es el encargado de guardar los datos en la base de datos.

```javascript
    // seed.js
    import fs from 'node:fs'

    import mongoose from 'mongoose'
        
    import connectDB from './model/connectDB.js'
    import Producto from './model/Producto.js'
        
    await connectDB()
        
    const datos_productos = Lee_archivo('datos_mercadona.json')
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
```
## ACTIVIDADES
Para esta lección se propone hacer dos actividades:
- Hacer otro programa consultas.js que muestre:
    - Productos de menos de 1 €
    - Productos de menos de 1 € que no sean agua
    - Aceites ordenados por precio
    - Productos en garrafa

A groso modo consultas.js  se encarga de conectarse a la bd y hacer las consultas con el método find para buscar en la base de datos.

```javascript
    import mongoose from 'mongoose'
    
    import connectDB from './model/connectDB.js'
    import Producto from './model/Producto.js'
        
    await connectDB() //Conectamos con la base de datos

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

    mongoose.connection.close() //Desconectamos de la base de datos
```

- Hacer una copia de seguridad
Para esto he creadi un script backup.js, en el usamos mongodump como se nos propone en el guión:
>mongodump --uri="mongodb://root:example@localhost:27017/DAI?authSource=admin" --out="./model"

mongodump es una orden para hacer copias de seguridad de la BD, en esta orden yo he usado --uri que contiene la url a la base de datos y --out que es donde va a hacer la copia.
Para ejecutar esta orden en javascript se necesita la función exec de child_procces, que permite ejecutar ordenes en scripts de javascript.

```javascript
    import mongoose from 'mongoose'
    import { exec } from 'child_process'; //función para ejecutar comandos 
    import connectDB from './connectDB.js'

    //Abrimos la conexión
    await connectDB()

    //Ejecutamos con exec la orden mongodump
    exec('mongodump --uri="mongodb://root:example@localhost:27017/DAI?authSource=admin" --out="./model"', (err) => {                
            console.error(`connection error: ${err}`);
        });

    //Cerramos la conexión
    mongoose.connection.close()
```