const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("../db/models");
const sequelize = require("sequelize");
const Op = db.Sequelize.Op;
const { v4: uuidv4 } = require("uuid");
const passport = require("passport");

const usersController = {
  allUsers: async function (req, res) {
    //res.sendFile(path.join(__dirname, '../views/register.ejs'));
    // res.render("./users/register");
    const users = await db.Usuario.findAll();
    res.json(users)
  },
  register: function (req, res) {
    //res.sendFile(path.join(__dirname, '../views/register.ejs'));
    res.render("./users/register");
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
        category: req.body.category ? req.body.category : false,
        lastAccess: new Date(),
        image: req.file?.filename || "/images/users/default-image.jpg",
      };

      await db.Usuario.create(newUser);
      res.status(200).json({message:"Se registro correctamente el usuario", type:"success"});
    } catch (error) {
      console.log(error);
    }
  },

  login: function (req, res) {
    //res.sendFile(path.join(__dirname, '../views/login.ejs'));
    res.render("./users/login");
  },
  processLogin: passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
    badRequestMessage: "Todos los campos son obligatorios",
  }),
  profile: function (req, res) {
    res.render("./users/profile", { userLogged: req.user });
  },

  edit: function (req, res) {
    console.log(req.cookies.userEmail);
    // res.send(req.session.userLogged)
    res.render("./users/edit", { usuario: req.session.userLogged });
  },

  editProfile: function (req, res) {
    console.log(req.body);
  },
  logout: function (req, res) {
    //Eliminamos los datos de sesion
    req.session.destroy(() => {
      res.redirect("/"); //al cerrar sesion nos lleva al login
    });
  },
  delete: async (req, res) => {
    try {
        const userToDelete = await db.Usuario.findByPk(req.params.id);
        
        if (!userToDelete) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar si la imagen no es la predeterminada antes de intentar eliminarla
        if (userToDelete.image !== '/images/users/default-image.jpg') {
            try {
                // Eliminar la imagen del servidor
                fs.unlinkSync(path.join(__dirname, '../../public/images/users/', userToDelete.image));
            } catch (error) {
                // Manejar el error específico de eliminación de imagen
                console.log(`Error al eliminar la imagen del usuario: ${error.message}`);
                return res.status(500).json({ error: 'Error interno del servidor al eliminar la imagen' });
            }
        }

        // Eliminar el producto de la base de datos
        await db.Usuario.destroy({
            where: {
                userId: req.params.id
            }
        });

        res.status(200).json({
          message: "Se elimino el usuario correctamente"
        });
    } catch (error) {
        console.log(`Error al eliminar el producto: ${error.message}`);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el producto' });
    }
}
};

module.exports = usersController;
