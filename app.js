const express = require('express'); //importando express
const Joi = require('joi');
const morgan = require('morgan') //morgan sirve para llegar un registro de las peticiones\
const config = require('config'); //Configuracion del entorno
const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');


const logger = require('./logger');

const app = express();

app.use(express.json()); //Para que sea posible mandar informacion como json
app.use(express.urlencoded({extended:true})); //Para que sea posible mandar informacion como formulario
app.use(express.static('public')); //Hace que los recursos estaticos sean en la carpeta public

//Configuración de entornos
console.log('Aplicación: '+config.get('nombre'));
console.log('BD server: '+config.get('configDB.host'));

//Usando un middleware de tercero - morgan
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado');
    debug('Morgan esta habilitado');
}

//Trabajos con la base de datos
debug('Conectando con la bd..');



//app.use(logger);

// app.use(function(req,res,next){
//     console.log('Autenticando...');
//     next();
// })

const usuarios = [
    {id:1, nombre:'Juan'},
    {id:2, nombre: 'Luis'},
    {id:3, nombre: 'Gael'},
]
app.get('/', (req,res) => {
    res.send('Hola mundo desde Express');
}); //petición

app.get('/api/usuarios',(req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:year/:month', (req, res) =>{
    res.send(req.query);
    // http://localhost:3000/api/usuarios/2004/2?sexo=masculino
}); //poner dos puntos despues de id para que el ide sepa que es un parametro
//metodo obtener
app.get('/api/usuarios/:id', (req, res) =>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 
    else res.status(202).send(usuario);
    // http://localhost:3000/api/usuarios/1
});
//metodo agregar
app.post('/api/usuarios/', (req, res) => { //solicitud post
    //esquema Joi para validaciones
    function existeUsuario(id){
        return(usuarios.find(u => u.id === parseInt(id)));
    }
    const {error,value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.status(202).send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(404).send(mensaje); //Bad Request
    }
});
//metodo modificar
app.put('/api/usuarios/:id', (req,res) => {
    //Encontrar si existe el objeto usuario
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 
    
    const {error, value} = validarUsuario(req.body.nombre);

    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje); //Bad Request
        return;
    }

    usuario.nombre = value.nombre;
    res.status(202).send(usuario);
});
//metodo delete
app.delete('/api/usuarios/:id', (req, res) =>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); //index es la variable desde donde se va a eliminar, y el 1 es la cantidad que se va a eliminar (en este caso solo se eliminaria el de la id)

    res.send(usuario);
});

const port = process.env.PORT || 3000;


app.listen(port, ()=> { //codigo para iniciar el servidor
    console.log(`Escuchado en el puerto ${port}...`);
    console.log("Servidor iniciado");
})
//funciones
function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}
function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });
    return (schema.validate({ nombre: nom}));
}
//app.post(); //envio de datos
//app.put(); //actualización
//app.delete(); //eliminación