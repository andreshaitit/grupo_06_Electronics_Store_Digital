//requiere
const express = require ('express');
const app = express();
const port = 3005;
const path = require('path')

//configuracion
app.use(express.static('public'));

// Config de Motor de vistar o template engine
app.set('view engine','ejs')
app.set('views', path.join(__dirname, './views'))

const mainRoutes = require('./routes/main.routes.js')
const usersRoutes = require('./routes/users.routes.js')
const productRoutes = require('./routes/product.routes.js')

app.use('/', mainRoutes)
app.use('/users', usersRoutes)
app.use('/producto', productRoutes)

app.listen(port, ()=>{
  console.log(`Nuestra app corre en http://localhost:${port}`);
})