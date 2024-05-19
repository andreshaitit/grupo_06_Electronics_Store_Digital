const sequelize = require('sequelize');
const {DataTypes} = require('sequelize');
 
module.exports = (sequelize, DataTypes) => {

    const cols = {

        id_product: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        id_brand: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        characteristics: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        warranty: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        shipping: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_category: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_state: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(3000),
            allowNull: true
        },
        visualizations: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        image: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    };

    const config = {
        tableName: 'products',
        timestamps: false,
    }

    const Producto = sequelize.define("Producto", cols, config)

    //Definimos las relaciones
    Producto.associate = function (models) {
        
        //Relacion pertenece a una marca
        Producto.belongsTo(models.Marca, {
            as: "brand",
            foreignKey: "id_brand"
        })

        //Relacion pertenece a una categoria
        Producto.belongsTo(models.Categoria, {
            as: "category",
            foreignKey: "id_category"
            //ERROR COMETIDO: haber escrito foreingkey X
        })

        //Relacion pertenece a un estado
        Producto.belongsTo(models.Categoria, {
            as: "state",
            foreignKey: "id_state"
        })
    }

    return Producto;
}