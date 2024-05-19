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
        tableName: 'brands',
        timestamps: false,
    };

    const Marca = sequelize.define('Marca',cols,config);

    //Definimos las relaciones
    Marca.associate = function (models){
        //Relacion tiene muchas productos
        Marca.hasMany(models.Producto, {
            as: "products",
            foreignKey: "id_brand"
        })
    }

    return Marca
}