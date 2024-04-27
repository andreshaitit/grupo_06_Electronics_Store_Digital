const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("../db/models");
const sequelize = require("sequelize");
const Op = db.Sequelize.Op;
const { v4: uuidv4 } = require("uuid");
const passport = require("passport");

const usersController = {
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
        category: false,
        lastAccess: new Date(),
        image: req.file?.filename || "/images/users/default-image.jpg",
      };

      await db.Usuario.create(newUser);
      res.redirect("/user/register");
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
};

module.exports = usersController;
