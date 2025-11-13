import mongoose from 'mongoose';
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
    admin: {
        type: Boolean,
        default: false,
        required: false
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