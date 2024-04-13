// ************ Require's ************
 express = require('express');
const router = express.Router();

// ************ Controller Require ************
const productsController = require('../controllers/productsController');
const update = require('../middlewares/multer');
const validations = require('../middlewares/validateProduct');
const isLogged = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminRequired');
const { Router } = require('express');

/*** GET ALL PRODUCTS ***/ 
router.get('/list', productsController.list);

/*** GET ALL PRODUCTS BY CATEGORY  ***/
router.get('/category/:category', productsController.listByCategory);
router.get('/brand/:category', productsController.listBrandsByCategory);

/*** GET ALL PRODUCT SEARCHS ***/
router.get('/search', productsController.search);

/*** CREATE ONE PRODUCT ***/ 
router.get('/create', isLogged, isAdmin, productsController.create);
router.post('/create', isLogged, isAdmin, update.single('image'), validations, productsController.keep);

/*** GET ONE PRODUCT ***/ 
router.get('/detail/:id', productsController.detail);

/*** EDIT ONE PRODUCT ***/ 
router.get('/edit/:id', isLogged, isAdmin, productsController.edit);
router.put('/edit/:id', isLogged, isAdmin, update.single('image'), validations, productsController.update);

/*** DELETE ONE PRODUCT***/
router.delete('/delete/:id', isLogged, isAdmin, productsController.delete); 

module.exports = router