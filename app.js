//requiere
const express = require ('express');
const path = require ('path');

const app = express();
const port = 3005;

const mainRoutes = require('./src/routes/mainRoutes');
const productsRoutes = require('./src/routes/productsRoutes');
const usersController = require('./src/routes/usersRoutes');

//configuracion
app.use(express.static(path.join(__dirname, 'public')))

//Configuracion de motor de vista o template engine
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'src', 'views'));

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
})*/

app.post('/register', (req, res)=>{
  console.log("Recibimos la informacion");
  res.redirect("/")
})

app.get('/productCart', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productCart.html'))
})

app.listen(port, ()=>{
  console.log(`Nuestra app corre en http://localhost:${port}`);
})