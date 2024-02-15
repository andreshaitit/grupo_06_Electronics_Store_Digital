// ************ Require's ************
 express = require('express');
const router = express.Router();

// ************ Controller Require ************
const productsController = require('../controllers/productsController');
const update = require('../middlewares/multer');
const validations = require('../middlewares/validateProduct');

/*** GET ALL PRODUCTS ***/ 
router.get('/list', productsController.list);

/*** CREATE ONE PRODUCT ***/ 
router.get('/create', productsController.create);
router.post('/create', update.single('image'), productsController.keep);

/*** GET ONE PRODUCT ***/ 
router.get('/detail/:id', productsController.detail);

/*** EDIT ONE PRODUCT ***/ 
router.get('/edit/:id', productsController.edit);
router.put('/edit/:id', update.single('image'), productsController.update);

/*** DELETE ONE PRODUCT***/
router.delete('/delete/:id', productsController.delete); 

module.exports = router