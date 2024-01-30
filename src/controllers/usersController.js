const path = require('path');

const usersController = {
    login: function (req, res) {
        //res.sendFile(path.join(__dirname, '../views/login.ejs'));
        res.render('./users/login');
    },
    register: function (req, res) {
        //res.sendFile(path.join(__dirname, '../views/register.ejs'));
        res.render('./users/register');
    },
}

module.exports = usersController;