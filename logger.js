import winston from 'winston'; //importamos wiston 
const { combine, timestamp, printf, colorize, align } = winston.format; // importamos herramientas de formato

// Formato para los ficheros de log (sin colores)
const fileFormat = combine(
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A', //Formato de la fecha
    }),
    align(), //alineamos el mensaje
    printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`) //Formato del log
);

// Formato para la consola (con colores)
const consoleFormat = combine(
    colorize({ all: true }), //Coloreamos todo el mensaje
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A', //Formato de la fecha
    }),
    align(), //alineamos el mensaje
    printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`) //Formato del log
);

//Creamos el logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // establecemos si no hay nivel por defecto es info              
    transports: [ 
        new winston.transports.Console({ format: consoleFormat }), //Los mostramos en consola con su formato
        new winston.transports.File({ //Todos los mensajes del log
            filename: 'combined.log',
            format: fileFormat, // Usamos el formato de fichero
        }),
        new winston.transports.File({ //Solo los errores
            filename: 'app-error.log',
            level: 'error',
            format: fileFormat, // Usamos el formato de fichero
        }),
    ],
});

export default logger;
