const fs = require('fs');
const path = require('path');
const  bcrypt = require('bcryptjs');
const db = require('../db/models')
const sequelize = require('sequelize');
const Op = db.Sequelize.Op;
const { v4: uuidv4 } = require('uuid');

const usersFilePath = path.join(__dirname, '../data/users.json');

const usersController = {

    register: function (req, res) {
        //res.sendFile(path.join(__dirname, '../views/register.ejs'));
        res.render('./users/register');
    },

    processRegister: async function (req, res) {
        //let result = validationResult(req)
        try {
            // crear el usuario
            const newUser = {
                userId: uuidv4(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10), //Encriptamos la contraseña
                category: false,
                lastAccess: new Date(),             
                image: req.file?.filename || "/images/users/default-image.jpg"
            }
            
            await db.Usuario.create(newUser);
            res.redirect('/user/register');
        } catch (error) {
            console.log(error)
        }
    },

    login: function (req, res) {
        //res.sendFile(path.join(__dirname, '../views/login.ejs'));
        res.render('./users/login');
    },

    processLogin: function (req, res) {
        
        //Se lee nuevamente el JSON por modificacion de la variable contenedora
        let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8')); 
        //Buscamos si existe un usuario registrado con ese correo
        let userToLogin = users.find(user => user.email == req.body.email);

        if(userToLogin){

            let isOkThePassword = bcrypt.recompaSync(req.body.password, userToLogin.password)

            if( isOkThePassword){

                //Mantenemos la sesion del usuario loqueado
                delete userToLogin.password; //Borramos la contraseña
                req.session.userLogged = userToLogin;

                //Recordamos la sesion del usuario en una cookie si asi lo desea
                if(req.body.remember_user){
                    console.log('Ingreso el usuario');
                    res.cookie('userEmail', req.body.email,{maxAge:(1000*60)*2})
                }

                // res.send('Has ingresado a tu cuenta')
                res.redirect('/user/profile/')
                //Si la contraseña es correcta se redirige al perfil del usuario
            } else{
                res.render('./users/login', {
                    errors: {
                        password: {
                            msg: 'Las credenciales son invalidas'
                        }
                    }
                });
            }
            
        } else{
            res.render('./users/login', {
                errors: {
                    email: {
                        msg: 'El correo ingresado no se corresponde a un usuario registrado'
                    }
                }
            });
        }

    },

    profile: function (req, res) {
        console.log(req.session.userLogged)
        // res.send(req.session.userLogged)
        res.render('./users/profile',{usuario:req.session.userLogged})
    },
    
    edit: function (req, res) {
        console.log(req.cookies.userEmail)
        // res.send(req.session.userLogged)
        res.render('./users/edit',{usuario:req.session.userLogged})
    },
    
    editProfile: function (req, res) {
        console.log(req.body)
    },

    logout: function(req, res){
        //Eliminamos los datos de sesion
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');
    }
}

module.exports = usersController;