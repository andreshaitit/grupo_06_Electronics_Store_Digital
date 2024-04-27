//requiere
const express = require ('express');
const logger = require('morgan');
const path = require ('path');
const session = require('express-session');
const cookies = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

const methodOverride = require('method-override');

const mainRoutes = require('./src/routes/mainRoutes');
const productsRoutes = require('./src/routes/productsRoutes');
const usersController = require('./src/routes/usersRoutes');
const userLogged = require('./src/middlewares/userLoggedMiddleware');
const passport = require('./src/db/config/passport');
//const { cookie } = require('express-validator');

//configuraciones
app.use(express.static(path.join(__dirname, 'public'))) // Necesario para los archivos estáticos en el folder /public
app.use(express.urlencoded({extended: false})); //Permite configurar el servidor para recivir los datos del formulario
app.use(logger('dev')); //indica el tipo de peticion que se esta haciendo
app.use(express.json());
app.use(methodOverride('_method')); // Pasar poder pisar el method="POST" en el formulario por PUT y DELETE
app.use(session({
  secret: 'Shhh, es un secreto',
  resave: false,
  saveUninitialized: false
}))
app.use(cookies());

app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

//Configuracion de motor de vista o template engine
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'src', 'views'));

//Middlewares
app.use(userLogged) //Es importante que la session se inicialice antes

//Configuracion de rutas
app.use('/',mainRoutes);

/*
app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})*/

app.use('/product', productsRoutes);

/*
app.get('/productList', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productList.html'))
})

app.get('/productDetail', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productDetail.html'))
})*/

app.use('/user',usersController);

/*
app.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'login.html'))
})

app.get('/register', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'register.html'))
})

app.post('/register', (req, res)=>{
  console.log("Recibimos la informacion");
  res.redirect("/")
})

app.get('/productCart', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productCart.html'))
})*/
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  next();
})

app.listen(port, ()=>{
  console.log(`Nuestra app corre en http://localhost:${port}`);
})