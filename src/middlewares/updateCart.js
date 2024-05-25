const cartController = require('../controllers/shoppingCartController');

const updateCart = async (req, res, next) => {
    try {
        // Ejecutar la lógica de compra del carrito
        const result = await cartController.searchActiveCart(req, res);
        console.log(result);

        // Inicializar `userCart` en la sesión si no existe
        if (!req.session.userCart) {
            req.session.userCart = {
                id_order: null,
                creation_date: null,
                total_amount: null,
                id_state: null,
                id_user: null,
                quantity_products: null
            };
        }

        // Continuar con la siguiente middleware o ruta
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = updateCart;