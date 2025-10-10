import mongoose from 'mongoose'
import { exec } from 'child_process'; //función para ejecutar comandos 
import connectDB from './connectDB.js'

await connectDB()

exec('mongodump --uri="mongodb://root:example@localhost:27017/DAI?authSource=admin" --out="./model"', (err) => {                
		console.error(`connection error: ${err}`);
	});

mongoose.connection.close()