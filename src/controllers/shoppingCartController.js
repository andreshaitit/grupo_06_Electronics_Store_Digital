const { v4: uuidv4 } = require('uuid');
const db = require('../db/models')
const sequelize = require('sequelize');
const { message } = require('statuses');
const Op = db.Sequelize.Op;

//Funcion que crea un nuevo carrito(orden de compra)
//Requiere el id del usuario
async function createCart(idUser) {
    if (!idUser) {
        throw new Error("Se requiere el ID del usuario");
    }

    try {
        const newOrder = await db.OrdenDeCompra.create({
            id_order: uuidv4(),
            creation_date: new Date(),
            total_amount: 0.00,
            id_state: 1,
            id_user: idUser,
        });

        // Devuelve el ID de la orden creada
        return newOrder;
    } catch (error) {
        console.error(error);
        throw new Error('Error interno del servidor');
    }
}

async function quantityOfProducts(idOrder) {
    try {
        const count = await db.DetalleOrden.count({
            where: { id_order: idOrder }
        });
        return count;
    } catch (error) {
        console.error(error);
        throw new Error('Error interno del servidor');
    }
}

const shoppingCartController = {

    //FUCIONES PARA EMPLEAR FUERA DEL CARRITO
    //Buscar si el usuario tiene un carrito activo, es decir con estado 1 o 2
    searchActiveCart: async (req, res) => {
        try {
            const idUser = req.user.userId; // Obtener el id del usuario logueado

            console.log('Tiene un carrito',idUser);
    
            // Consulta para obtener la última orden con estado diferente a 3 del usuario especificado
            const activeCart = await db.OrdenDeCompra.findOne({
                where: {
                    id_user: idUser,
                    id_state: {
                        [Op.not]: 3 // Excluir el estado 3
                    }
                },
                // Incluir la asociación con los detalles de la orden
                include: [
                    {
                        association: "order_details", // Incluir la asociación con los detalles de la orden
                        attributes: [] // No seleccionar ninguna columna adicional en los detalles de la orden
                    }
                ],
                // Ordenar por fecha de creación de forma descendente para obtener la última orden
                order: [['creation_date', 'DESC']]
            });
    
            if (activeCart) {
                // Contar la cantidad de detalles de orden vinculadas a la orden encontrada
                const quantityProducts = await quantityOfProducts(activeCart.id_order);
    
                // Devolver la información de la última orden de compra y la cantidad de detalles de la orden
                req.session.userCart = {
                    id_order: activeCart.id_order,
                    creation_date: activeCart.creation_date,
                    total_amount: activeCart.total_amount,
                    id_state: activeCart.id_state,
                    id_user: activeCart.id_user,
                    quantity_products: quantityProducts
                };

                res.json(req.session.userCart);
                
            } else {
                return res.status(404).json({ message: 'No se encontró una orden de compra iniciada para este usuario.'});
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    //Verifica la fecha del ultimo carrito creado para lanzar una notificacion de ser necesario
    //Si el carrito tiene estado Demorado lanzar una notificacion
    //Si el carrito tiene estado distinto de Comprado seguir
    //Si el carrito tiene mas de una semana sin haberse confirmado la compra, cambiar su estado a Demorado
    //Lanzar una notificacion al usuario para que realice la compra
    checkCartNotifications: async (req, res) => {
        // Verificar si el usuario tiene una orden en la sesión
        if (!req.session.userCart || !req.session.userCart.id_order) {
            return res.status(404).json({ error: "No hay un carrito activo para este usuario" });
        }

        const id_order = req.session.userCart.id_order;

        try {
            // Buscar la orden por su ID
            let order = await db.OrdenDeCompra.findByPk(id_order);
    
            if (!order) {
                return res.status(404).json({ error: "Orden de compra no encontrada" });
            }
    
            // Obtener la fecha actual y la fecha de creación de la orden
            const currentDate = new Date();
            const creationDate = new Date(order.creation_date);
    
            // Calcular la diferencia en milisegundos y convertirla a días
            const diffTime = Math.abs(currentDate - creationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
            // Si la diferencia es mayor a 7 días, actualizar el estado de la orden
            if (diffDays > 7) {
                await order.update({
                    id_state: 2
                });
    
                return res.status(200).json({ message: "Tienes una orden de compra pendiente, cancela y podrás disfrutar de tus productos" });
            }
    
            return res.status(200).json({ message: "Sigue buscando productos de tu interés y agrégalos a tu orden" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },
    

    //Agregar un producto al carrito, requiere el id del usuario y del producto
    //Si no se encuentra un carrito con estado iniciado se debe crear uno nuevo
    //Verificar si el producto ya se encuentra en el carrito
    //Verificar que el producto se encuentra disponible
    addProductToCart: async (req, res) => {

        let id_order = req.session.userCart?.id_order || null;

        const id_producto = req.params.product;
    
        try {
            if (!id_order) {
                // Crear una nueva orden de compra si no existe
                console.log("Hay que crear una orden de compra");
                const newOrder = await createCart(req.user.userId);
                id_order = newOrder.id_order;
            }
    
            // Verificar si el producto ya está en el detalle de la orden
            let productDetail = await db.DetalleOrden.findOne({
                where: {
                    id_order: id_order,
                    id_product: id_producto,
                }
            });
    
            if (productDetail) {
                return res.status(200).json({ message: "El producto ya se encuentra en la orden" });
            } else {
                // Si el producto no está en el carrito, agregarlo
                await db.DetalleOrden.create({
                    id_order: id_order,
                    id_product: id_producto,
                    amount: req.body.quantity
                });

                req.session.userCart.quantity_products = await quantityOfProducts(id_order);

                return res.status(200).json({ 
                    success: true,
                    message: "Producto agregado correctamente a la orden" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    },    

    //FUNCIONES A AGREGAR EN EL CARRITO

    //VALIDAR: que el usuario halla iniciado sesion
    //VALIDAR: que la orden pertenece al usuario logueado y que no tiene estado 3
    //Listar todos los productos que se agregaron al carrito
    listProductsFromCart: async (req, res) => {
        // Verificar si el usuario tiene una orden en la sesión
        if (!req.session.userCart || !req.session.userCart?.id_order) {
            //return res.status(404).json({ error: "No hay un carrito activo para este usuario" });
            return res.render('productCart',{products: null})
        }

        const id_order = req.session.userCart.id_order;
    
        try {
            let detailProducts = await db.DetalleOrden.findAll({
                where: { id_order: id_order },
                include: [
                    {
                        association: "products", // Incluir la asociación con los productos
                        attributes: ['id_product', 'name', 'stock', 'id_state', 'image']
                    }
                ],
                attributes: ['id_product', 'amount'] // Incluir los atributos del detalle de la orden
            });
    
            if (!detailProducts || detailProducts.length === 0) {
                return res.status(404).json({ error: "No se encontraron detalles de la orden" });
            }
    
            // Formatear la respuesta para incluir detalles del producto
            const response = detailProducts.map(detail => ({
                id_product: detail.id_product,
                name: detail.products.name,
                stock: detail.products.stock,
                id_state: detail.products.id_state,
                image: detail.products.image,
                amount: detail.amount
            }));
    
            //return res.status(200).json(response);
            return res.render('productCart',{products: response})
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },
    

    //VALIDAR: que el usuario halla iniciado sesion
    //VALIDAR: que la orden pertenece al usuario logueado y que no tiene estado 3
    //Actualizar la cantidad de un producto en la lista del carrito
    //Requiere el id de la orden de compra y el id del producto
    updateProductDetail: async (req, res) => {
        // Verificar si el usuario tiene una orden en la sesión
        if (!req.session.userCart || !req.session.userCart.id_order) {
            return res.status(404).json({ error: "No hay un carrito activo para este usuario" });
        }

        const id_order = req.session.userCart.id_order;
        const id_product = req.params.product;
        const newAmount = parseInt(req.body.cantidad, 10); // Validar y convertir la cantidad a entero
    
        if (isNaN(newAmount) || newAmount <= 0) {
            console.log('Cantidad requerida del producto', newAmount, req.body.cantidad);
            return res.status(400).json({ error: "La cantidad debe ser un número positivo" });
        }

        console.log('Cantidad requerida del producto:',newAmount);
    
        try {
            // Obtener los detalles del producto a actualizar
            const productUpdate = await db.DetalleOrden.findOne({
                where: {
                    id_order: id_order,
                    id_product: id_product,
                },
                include: [
                    {
                        association: "products", // Incluir la asociación con los productos
                        attributes: ['stock'] // Incluir solo el stock del producto
                    }
                ],
            });
    
            if (!productUpdate) {
                return res.status(404).json({ error: "No se encontró el detalle del producto" });
            }
    
            // Verificar si la nueva cantidad no supera el stock disponible
            if (newAmount > productUpdate.products.stock) {
                return res.status(400).json({ error: "La cantidad no puede ser mayor que el stock disponible del producto" });
            }
    
            // Actualizar la cantidad del producto en el detalle de la orden
            await productUpdate.update({
                id_order: productUpdate.id_order,
                id_product: productUpdate.id_product,
                amount: newAmount
            });
    
            return res.status(200).json({ 
                success: true,
                message: "Cantidad actualizada correctamente" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    },    

    //VALIDAR: que el usuario halla iniciado sesion
    //VALIDAR: que la orden pertenece al usuario logueado y que no tiene estado 3
    //Quitar un producto del carrito, requiere el id de la orden de compra y el id del producto
    removeProductFromCart: async (req, res) => {
        // Verificar si el usuario tiene una orden en la sesión
        if (!req.session.userCart || !req.session.userCart.id_order) {
            return res.status(404).json({ error: "No hay un carrito activo para este usuario" });
        }

        const id_order = req.session.userCart.id_order;
        const id_product = req.params.product;
        try {
            const productToDelete = await db.DetalleOrden.findOne({
                where: {
                    id_order: id_order,
                    id_product: id_product,
                }
            });
            
            if (!productToDelete) {
                return res.status(404).json({ error: "No se encontró el detalle del producto en la orden"  });
            }
    
            // Eliminar el detalle del producto
            await productToDelete.destroy();
    
            return res.status(200).json({ 
                success: true,
                message: "Producto eliminado correctamente de la orden" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    //VALIDAR: que el usuario halla iniciado sesion
    //VALIDAR: que la orden pertenece al usuario logueado y que no tiene estado 3
    //Realizar la compra del carrito, requiere el id de la orden de compra
    //Verificar los detalles de la orden de compra donde
    //Cada producto debe estar disponible y tener stock disponible
    //Especificar el metodo de pago
    makeCartPurchase: async (req, res) => {
        // Verificar si el usuario tiene una orden en la sesión
        if (!req.session.userCart || !req.session.userCart.id_order) {
            return res.status(404).json({ error: "No hay un carrito activo para este usuario" });
        }

        const id_order = req.session.userCart.id_order;
        const payment = req.body.payment;
    
        try {
            // Obtener los productos que no están disponibles o su stock es menor
            const invalidProducts = await db.Producto.findAll({
                include: [
                    {
                        association: "order_details",
                        attributes: ['amount'],
                        where: { id_order: id_order }
                    }
                ],
                where: {
                    [Op.or]: [
                        {
                            id_state: {
                                [Op.not]: 1 // Estado diferente de disponible
                            }
                        },
                        {
                            stock: {
                                [Op.lt]: Sequelize.col('order_details.amount') // Stock menor que la cantidad en el detalle
                            }
                        }
                    ]
                }
            });
    
            // Si hay productos no válidos
            if (invalidProducts.length > 0) {
                return res.status(400).json({ 
                    message: "Hay productos que no están disponibles o superan el stock",
                    invalidProducts: invalidProducts.map(product => ({
                        id: product.id,
                        name: product.name,
                        stock: product.stock,
                        amountRequested: product.order_details[0].amount,
                        id_state: product.id_state
                    }))
                });
            }
    
            // Obtener la orden a actualizar
            const updateOrder = await db.OrdenDeCompra.findOne({
                where: { id_order: id_order }
            });
    
            if (!updateOrder) {
                return res.status(404).json({ error: "Orden de compra no encontrada" });
            }
    
            // Actualizar la orden
            await updateOrder.update({
                purchase_date: new Date(),
                payment_method: payment,
                id_state: 3
            });
    
            return res.status(200).json({ message: "Orden de compra actualizada correctamente" });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
    
}

module.exports = shoppingCartController;