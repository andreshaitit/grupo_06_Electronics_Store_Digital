// ************ Require's ************
express = require('express');
const router = express.Router();

// ************ Controller Require ************
const cartController = require('../controllers/shoppingCartController');
const isLogged = require('../middlewares/authMiddleware');
const updateCart = require('../middlewares/updateCart');

/*** GET ACTIVE CART ***/
router.get('/active', isLogged, cartController.searchActiveCart);

/*** GET CART NOTIFICATIONS ***/
router.get('/notify', isLogged, cartController.checkCartNotifications);

/*** ADD A PRODUCT TO THE CART ***/
router.post('/add/:product', isLogged, updateCart, cartController.addProductToCart);

/*** GET ALL PRODUCTS IN THE CART ***/
router.get('/list', isLogged, updateCart, cartController.listProductsFromCart);

/*** UPDATE A PRODUCT IN THE CART ***/
router.put('/update/:product', isLogged, updateCart, cartController.updateProductDetail);

/*** REMOVE A PRODUCT FROM THE CART ***/
router.delete('/remove/:product', isLogged, updateCart, cartController.removeProductFromCart);

/*** UPDATE ORDER STATUS ***/
router.put('/payment', isLogged, updateCart, cartController.makeCartPurchase);

module.exports = router