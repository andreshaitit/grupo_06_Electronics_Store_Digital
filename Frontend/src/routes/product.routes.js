const express = require("express");
const productControllers = require("../controllers/productControllers");
const router = express.Router()

router.get('/', (req, res) => res.send('Entraste al apartado de productos'))
router.get('/detalle/:id', productControllers.detail)

module.exports = router;