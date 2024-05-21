const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    const cols = {
        id_order: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        creation_date: {
            type: DataTypes.DATE
        },
        purchase_date: {
            type: DataTypes.DATE
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        payment_method: {
            type: DataTypes.STRING(50)
        },
        id_state: {
            type: DataTypes.INTEGER
        },
        id_user: {
            type: DataTypes.STRING(50)
        }
    }

    const config = {
        tableName: 'purchase_orders',
        timestamps: false,
    }

    const OrdenDeCompra = sequelize.define("OrdenDeCompra", cols, config)

    //Definimos las relaciones
    OrdenDeCompra.associate = function (models) {
        
        //Relacion tiene un estado de orden
        OrdenDeCompra.belongsTo(models.EstadoOrden, {
            as: "order_states",
            foreignKey: "id_state"
        })

        //Relacion pertenece a un usuario
        OrdenDeCompra.belongsTo(models.Usuario, {
            as: "users",
            foreignKey: "id_user"
        })

        //Relacion tiene muchos detalles de la orden
        OrdenDeCompra.hasMany(models.DetalleOrden, {
            as: "order_details",
            foreignKey: "id_order"
        });

    }

    return OrdenDeCompra;

};