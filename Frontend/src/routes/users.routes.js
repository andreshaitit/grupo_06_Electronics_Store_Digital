const express = require("express");
const usersControllers = require("../controllers/usersControllers");
const router = express.Router()

router.get('/', (req, res) => res.send('Entraste al apartado de usuarios'))
router.get('/register', usersControllers.register)
router.get('/login', usersControllers.login)


module.exports = router;