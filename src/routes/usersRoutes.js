const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const usersController = require('../controllers/usersController');
const update = require('../middlewares/multer');
const validations = require('../middlewares/validateProduct');
const checkLogged = require('../middlewares/guestMiddleware');
const isLogged = require('../middlewares/authMiddleware');

//Formulario de registro
router.get('/register', checkLogged, usersController.register)

//Procesar el registro
router.post('/register',update.single('image'),  usersController.processRegister)

//Formulario de login
router.get('/login', checkLogged, usersController.login)

//Procesar el login
router.post('/login', usersController.processLogin)

//Perfil del usuario
router.get('/profile', isLogged, usersController.profile)

//Logout
router.get('/logout', usersController.logout)

module.exports = router;