const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    const cols = {
        /*
        id int AI PK 
        name varchar(255)
        */

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autincrement: true,
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }
    };

    const config = {
        tableName: 'categories',
        timestamps: false,
    };

    const Categoria = sequelize.define('Categoria',cols,config);

    //Definimos las relaciones
    Categoria.associate = function (models){
        //Relacion tiene muchas productos
        Categoria.hasMany(models.Producto, {
            as: "products",
            foreignKey: "id_category"
        })
    }

    return Categoria
}