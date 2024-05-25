const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    const cols = {
        id_order: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        id_product: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        amount: {
            type: DataTypes.INTEGER
        }
    }

    const config = {
        tableName: 'order_details',
        timestamps: false,
    }

    const DetalleOrden = sequelize.define("DetalleOrden", cols, config)

    //Definimos las relaciones
    DetalleOrden.associate = function (models) {

        //Relacion pertenece a una orden de compra
        DetalleOrden.belongsTo(models.OrdenDeCompra, {
            as: "purchase_orders",
            foreignKey: "id_order"
        })

        //Relacion tiene un producto
        DetalleOrden.belongsTo(models.Producto, {
            as: "products",
            foreignKey: "id_product"
        })

    }

    return DetalleOrden;

};