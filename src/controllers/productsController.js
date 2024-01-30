const path = require('path');

const productsController = {
    list: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productList.ejs'));
        res.render('./products/productList');
    },

    detail: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productDetail.ejs'));
        res.render('./products/productDetail');
    },

    create: function(req,res){
        res.render('./products/productCreate');
    },

    update: function(req,res){
        res.render('./products/productUpdate');
    }
}

module.exports = productsController;