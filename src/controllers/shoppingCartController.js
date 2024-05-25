const { v4: uuidv4 } = require('uuid');
const db = require('../db/models')
const sequelize = require('sequelize');
const { message } = require('statuses');
const Op = db.Sequelize.Op;

//Funcion que crea un nuevo carrito(orden de compra)
//Requiere el id del usuario
async function createCart(idUser, transaction) {
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
        }, { transaction });

        // Devuelve la orden creada
        return newOrder;
    } catch (error) {
        console.error(error);
        throw new Error('Error interno del servidor');
    }
}

async function quantityOfProducts(idOrder, transaction) {
    try {
        const count = await db.DetalleOrden.count({
            where: { id_order: idOrder },
            transaction
        });
        return count;
    } catch (error) {
        console.error(error);
        throw new Error('Error interno del servidor');
    }
}

async function totalAmountPayable(id_order, transaction) {
    try {
        const totalAmount = await db.DetalleOrden.findAll({
            where: { id_order: id_order },
            include: [
                {
                    model: db.Producto,
                    as: 'products',
                    attributes: []
                }
            ],
            attributes: [
                [sequelize.literal('ROUND(SUM(amount * (products.price - (products.price * products.discount / 100))), 2)'), 'Total']
            ],
            raw: true,
            transaction
        });

        if (totalAmount.length > 0) {
            return parseFloat(totalAmount[0].Total).toFixed(2); // Formatear el resultado a 2 decimales
        } else {
            throw new Error('No se encontraron detalles de orden para esta orden');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error al calcular el monto total a pagar');
    }
}

const shoppingCartController = {

    //FUCIONES PARA EMPLEAR FUERA DEL CARRITO
    //Buscar si el usuario tiene un carrito activo, es decir con estado 1 o 2
    searchActiveCart: async (req, res) => {
        // Iniciar una transacción
        const transaction = await db.sequelize.transaction();

        try {
            const idUser = req.user.userId;

            const activeCart = await db.OrdenDeCompra.findOne({
                where: {
                    id_user: idUser,
                    id_state: {
                        [Op.not]: 3
                    }
                },
                include: [
                    {
                        association: "order_details",
                        attributes: []
                    }
                ],
                order: [['creation_date', 'DESC']],
                transaction
            });

            if (activeCart) {
                const quantityProducts = await quantityOfProducts(activeCart.id_order, transaction);

                // Commit de la transacción
                await transaction.commit();

                req.session.userCart = {
                    id_order: activeCart.id_order,
                    creation_date: activeCart.creation_date,
                    total_amount: activeCart.total_amount,
                    id_state: activeCart.id_state,
                    id_user: activeCart.id_user,
                    quantity_products: quantityProducts
                };

                //return res.status(200).json(req.session.userCart);
            } else {
                // Commit de la transacción
                await transaction.commit();
                req.session.userCart = {
                    id_order: null,
                    creation_date: null,
                    total_amount: null,
                    id_state: null,
                    id_user: null,
                    quantity_products: null
                };
                //return res.status(404).json({ message: 'No se encontró una orden de compra iniciada para este usuario.'});
            }
        } catch (error) {
            // Rollback de la transacción en caso de error
            await transaction.rollback();

            console.error(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
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
        // Iniciar una transacción
        const transaction = await db.sequelize.transaction();

        try {
            if (!id_order) {
                // Crear una nueva orden de compra si no existe
                console.log("Hay que crear una orden de compra");
                const newOrder = await createCart(req.user.userId, transaction );
                id_order = newOrder.id_order;
            }

            // Verificar si el producto ya está en el detalle de la orden
            let productDetail = await db.DetalleOrden.findOne({
                where: {
                    id_order: id_order,
                    id_product: id_producto,
                },
                transaction
            });

            if (productDetail) {
                await transaction.rollback();
                return res.status(200).json({ message: "El producto ya se encuentra en la orden" });
            } else {
                // Si el producto no está en el carrito, agregarlo
                await db.DetalleOrden.create({
                    id_order: id_order,
                    id_product: id_producto,
                    amount: req.body.quantity
                }, { transaction });

                req.session.userCart.quantity_products = await quantityOfProducts(id_order, transaction);

                // Actualizar el totalAmount en OrdenCompra
                const totalAmount = await totalAmountPayable(id_order, transaction);

                await db.OrdenDeCompra.update(
                    { total_amount: totalAmount },
                    { where: { id_order: id_order }, transaction }
                );
                req.session.userCart.total_amount =  totalAmount;

                // Commit de la transacción
                await transaction.commit();

                return res.status(200).json({
                    success: true,
                    message: "Producto agregado correctamente a la orden"
                });
            }
        } catch (error) {
            // Rollback de la transacción en caso de error
            await transaction.rollback();
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
                        association: "products",
                        attributes: ['id_product', 'name', 'price', 'discount', 'stock', 'id_state', 'image']
                    }
                ],
                attributes: ['id_product', 'amount']
            });
            if (!detailProducts || detailProducts.length === 0) {
                return res.status(404).json({ error: "No se encontraron detalles de la orden" });
            }
            // Formatear la respuesta para incluir detalles del producto
            const response = detailProducts.map(detail => ({
                id_product: detail.id_product,
                name: detail.products.name,
                price: detail.products.price,
                discount: detail.products.discount,
                stock: detail.products.stock,
                id_state: detail.products.id_state,
                image: detail.products.image,
                amount: detail.amount
            }));
            //return res.status(200).json(response);
            return res.render('productCart',{products: response, userCart: req.session.userCart});
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
        const newAmount = parseInt(req.body.cantidad, 10);

        if (isNaN(newAmount) || newAmount <= 0) {
            return res.status(400).json({ error: "La cantidad debe ser un número positivo" });
        }

        // Iniciar una transacción
        const transaction = await db.sequelize.transaction();

        try {
            const productUpdate = await db.DetalleOrden.findOne({
                where: {
                    id_order: id_order,
                    id_product: id_product,
                },
                include: [
                    {
                        model: db.Producto,
                        as: 'products',
                        attributes: ['stock']
                    }
                ],
                transaction
            });

            if (!productUpdate) {
                await transaction.rollback();
                return res.status(404).json({ error: "No se encontró el detalle del producto" });
            }

            if (newAmount > productUpdate.products.stock) {
                await transaction.rollback();
                return res.status(400).json({ error: "La cantidad no puede ser mayor que el stock disponible del producto" });
            }

            await productUpdate.update(
                { amount: newAmount },
                { transaction }
            );

            // Actualizar el totalAmount en OrdenCompra
            const totalAmount = await totalAmountPayable(id_order, transaction);
            console.log('Total a Pagar',totalAmount);

            await db.OrdenDeCompra.update(
                { total_amount: totalAmount },
                { where: { id_order: id_order }, transaction }
            );
            req.session.userCart.total_amount =  totalAmount;

            // Commit de la transacción
            await transaction.commit();

            return res.status(200).json({
                success: true,
                message: "Cantidad actualizada correctamente"
            });
        } catch (error) {
            // Rollback de la transacción en caso de error
            await transaction.rollback();
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
                return res.status(404).json({ error: "No se encontró el detalle del producto en la orden" });
            }

            // Iniciar una transacción
            const transaction = await db.sequelize.transaction();

            try {
                // Eliminar el detalle del producto
                await productToDelete.destroy({ transaction });

                // Actualizar la cantidad de productos en la sesión
                req.session.userCart.quantity_products = await quantityOfProducts(id_order, transaction);

                // Actualizar el totalAmount en OrdenCompra
                const totalAmount = await totalAmountPayable(id_order, transaction);

                await db.OrdenDeCompra.update(
                    { total_amount: totalAmount },
                    { where: { id_order: id_order }, transaction }
                );
                req.session.userCart.total_amount =  totalAmount;

                // Commit de la transacción
                await transaction.commit();

                return res.status(200).json({
                    success: true,
                    message: "Producto eliminado correctamente de la orden"
                });
            } catch (error) {
                // Rollback de la transacción en caso de error
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
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
        const payment = req.body.payment_method;

        const transaction = await db.sequelize.transaction();
        try {
            // Buscar si hay productos que no están disponibles o su stock es menor
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
                                [Op.lt]: sequelize.col('order_details.amount') // Stock menor que la cantidad en el detalle
                            }
                        }
                    ]
                },
                transaction
            });

            // Si hay productos no válidos
            if (invalidProducts.length > 0) {
                await transaction.rollback();
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

            // Obtener todos los productos de la orden para actualizar el stock
            const orderDetails = await db.DetalleOrden.findAll({
                where: { id_order: id_order },
                include: [{ association: "products", attributes: ['id_product', 'stock'] }],
                transaction
            });

            // Actualizar el stock de los productos
            for (let detail of orderDetails) {
                const product = detail.products;
                await product.update({
                    stock: product.stock - detail.amount
                }, { transaction });
            }

            // Obtener la orden a actualizar
            const updateOrder = await db.OrdenDeCompra.findOne({
                where: { id_order: id_order },
                transaction
            });

            if (!updateOrder) {
                await transaction.rollback();
                return res.status(404).json({ error: "Orden de compra no encontrada" });
            }

            // Actualizar la orden
            await updateOrder.update({
                purchase_date: new Date(),
                payment_method: payment,
                id_state: 3
            }, { transaction });

            // Confirmar la transacción
            await transaction.commit();

            const alert = {
                state: 'success',
                message: "La compra se realizó con éxito, esperamos que disfrutes de tus nuevos productos"
            };

            // Guardar la alerta en la sesión para que pueda ser utilizada después de la redirección
            req.session.alert = alert;

            // Redirigir al usuario a la página principal
            return res.redirect(302, '/');

        } catch (error) {
            console.error(error);
            await transaction.rollback();
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

module.exports = shoppingCartController;