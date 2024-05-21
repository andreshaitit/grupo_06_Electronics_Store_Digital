const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    const cols = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(10)
        }
    }

    const config = {
        tableName: 'order_states',
        timestamps: false,
    }

    const EstadoOrden = sequelize.define("EstadoOrden", cols, config)

    //Definimos las relaciones
    EstadoOrden.associate = function (models){
        //Relacion tiene muchas ordenes de compra
        EstadoOrden.hasMany(models.OrdenDeCompra, {
            as: "purchase_orders",
            foreignKey: "id_state"
        })
    }

    return EstadoOrden;

};