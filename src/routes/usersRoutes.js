const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const usersController = require('../controllers/usersController');
const update = require('../middlewares/multer');
const validations = require('../middlewares/validateUser');
const checkLogged = require('../middlewares/guestMiddleware');
const isLogged = require('../middlewares/authMiddleware');

//Total usuarios
router.get('/users', usersController.allUsers)

//Formulario de registro
router.get('/register', checkLogged, usersController.register)

//Procesar el registro
router.post('/register', checkLogged, update.single('image'),  usersController.processRegister)

//Formulario de login
router.get('/login', checkLogged, usersController.login)

//Procesar el login
router.post('/login', checkLogged, usersController.processLogin)

//Perfil del usuario
router.get('/profile', isLogged, usersController.profile)

//Editar usuario
router.get('/edit/:id', isLogged, usersController.edit)

router.post('/edit/:id', isLogged, usersController.editProfile)

//Logout
router.get('/logout', usersController.logout)

//Eliminar
router.delete('/delete/:id', usersController.delete)

module.exports = router;