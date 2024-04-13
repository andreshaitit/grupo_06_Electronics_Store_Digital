const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    const cols = {
        /*
        id int AI PK 
        name varchar(100)
        */

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autincrement: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        }
    };

    const config = {
        tableName: 'product_statuses',
        timestamps: false,
    };

    const EstadoProducto = sequelize.define('EstadoProducto',cols,config);

    //Definimos las relaciones
    EstadoProducto.associate = function (models){
        //Relacion tiene muchas productos
        EstadoProducto.hasMany(models.Producto, {
            as: "products",
            foreignKey: "id_state"
        })
    }

    return EstadoProducto
}