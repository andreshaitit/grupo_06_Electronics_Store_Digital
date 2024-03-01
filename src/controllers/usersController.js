const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const  bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../data/users.json');
let users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

const usersController = {

    register: function (req, res) {
        //res.sendFile(path.join(__dirname, '../views/register.ejs'));
        res.render('./users/register');
    },

    processRegister: function (req, res) {
        //let result = validationResult(req)

        if(true){

            console.log(req.body)

            const newUser = {
                userId: uuidv4(), //para generar IDs únicos basados en estándares universales.
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10), //Encriptamos la contraseña
                category: 'Usuario',
                lastAccess: new Date(),             
                image: req.file?.filename || "/images/users/default-image.jpg"
            }

            //Buscamos si ya existe un usuario con el mismo correo
            const userFound = users.find(user => user.email == newUser.email)

            if(userFound){
                res.render('./users/register',{
                    old: req.body,
                    errors: {
                        email: {
                            msg: 'El email ya está registrado'
                        }
                    }
                })

            }else{
                //Agregamos el nuevo usuario al listado
                users.push(newUser);
                //Convertimos a json el objeto javascript
                let usersJSON = JSON.stringify(users, null, ' ');
                //Procedimiento para cargarlo en el JSON
                fs.writeFileSync(usersFilePath, usersJSON)
                res.redirect('/user/login');
            }
            
        } else{
            
            res.render('./users/register',{
                old: req.body,
                error: result.mapped()
            })
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

            let isOkThePassword = bcrypt.compareSync(req.body.password, userToLogin.password)

            if( isOkThePassword){

                //Mantenemos la sesion del usuario loqueado
                delete userToLogin.password; //Borramos la contraseña
                req.session.userLogged = userToLogin;

                //Recordamos la sesion del usuario en una cookie si asi lo desea
                if(req.body.remember_user){
                    res.cookie('userEmail', req.body.email,{maxAge:(1000*60)*2})
                }

                res.send('Has ingresado a tu cuenta')
                //res.redirect('/user/profile/')
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
        console.log(req.cookies.userEmail)
        res.send(req.session.userLogged)
    },

    logout: function(req, res){
        //Eliminamos los datos de sesion
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');

    }
}

module.exports = usersController;