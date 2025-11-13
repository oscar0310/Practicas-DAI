 // ./model/Producto.js 
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
	},
	precio_rebajado: {
		type: Number,
		required: false,
		default: 0,
		trim: true
	}


})
const Producto = mongoose.model('Producto', productoSchema);
export default Producto