const Sequelize = require('sequelize');
const  bcrypt = require('bcryptjs');
const db = require('../db');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre es requerido'
            }
        }
    },
    lastName: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El apellido es requerido'
            }
        }
    },
    email: {
        type: Sequelize.STRING(60),
        allowNull : false,
        validate: {
            isEmail: {
                msg: 'Agrega un correo válido'
            },
            notEmpty: {
                msg: 'El e-mail no puede ir vacio'
            }
        },
        unique: {
            args: true,
            msg: 'Usuario ya registrado'
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacio'
            }
        }
    },
    category: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La categoria es requerida'
            }
        }
    },
    lastAccess: {
        type: Sequelize.TIME,
        allowNull: true,
    },
    image: {
        type: Sequelize.STRING(60),
        allowNull: true
    },
},{
    hooks: {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10));
        }
    }
});

module.exports = Usuarios;
