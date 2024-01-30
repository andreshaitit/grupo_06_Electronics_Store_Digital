const path = require('path');

const mainController = {
    home: function(req, res){
        //res.sendFile(path.join(__dirname, '../views/index.ejs'))
        res.render('index')
    },
    cart: function(req, res){
        res.render('productCart')
    }
}

module.exports = mainController;