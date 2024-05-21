const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const cols = {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        lastAccess: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(60),
            allowNull: true,
        }
    };

    const config = {
        tableName: 'users',
        timestamps: false,
        hooks: {
            beforeCreate(usuario) {
                usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10));
            }
        }
    }

    const Usuario = sequelize.define("Usuario", cols, config);
    
    Usuario.prototype.verificarPassword = function(password) {
        return true;
        // return bcrypt.compareSync(password, this.password);
    }

    //Definimos las relaciones
    Usuario.associate = function (models){
        //Relacion tiene muchas ordenes de compra
        Usuario.hasMany(models.OrdenDeCompra, {
            as: "purchase_orders",
            foreignKey: "id_user"
        })
    }

    return Usuario;
};