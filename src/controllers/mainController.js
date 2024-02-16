const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const mainController = {
    home: function(req, res){
        let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
        // Ordenar productos por precio de menor a mayor
        const productsByPrice = products.sort((a, b) => a.discount - b.discount).slice(0, 4);
        //console.log('Lista de productos por precio',productsByPrice);
        // Ordenar productos por cantidad de visualizaciones de mayor a menor
        const productsByVisualizations = products.sort((a, b) => b.visualizations - a.visualizations).slice(0, 4);
        //console.log('Lista de productos por visualizaciones',productsByVisualizations);
        res.render('index',{productsByPrice,productsByVisualizations})
    },
    cart: function(req, res){
        res.render('productCart')
    }
}

module.exports = mainController;