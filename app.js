//requiere
const express = require ('express');
const path = require ('path');

const app = express();
const port = 3005;

//configuracion
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

app.get('/productDetail', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productDetail.html'))
})

app.get('/register', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'register.html'))
})

app.post('/register', (req, res)=>{
  console.log("Recibimos la informacion");
  res.redirect("/")
})

app.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'login.html'))
})

app.get('/productCart', (req, res)=>{
  res.sendFile(path.join(__dirname, 'views', 'productCart.html'))
})

app.listen(port, ()=>{
  console.log(`Nuestra app corre en http://localhost:${port}`);
})