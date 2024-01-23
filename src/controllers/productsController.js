const path = require('path');

const productsController = {
    list: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productList.ejs'));
        res.render('productList');
    },

    detail: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productDetail.ejs'));
        res.render('productDetail');
    }
}

module.exports = productsController;