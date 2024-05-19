const fs = require('fs');
const path = require('path');
const db = require('../db/models');
const Op = db.Sequelize.Op;

//const productsFilePath = path.join(__dirname, '../data/products.json');
//let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const mainController = {
    home: async (req, res) =>{
        //let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Ordenar productos por precio de menor a mayor
        //const productsByPrice = products.sort((a, b) => a.discount - b.discount).slice(0, 4);
        //console.log('Lista de productos por precio',productsByPrice);

        // Ordenar productos por cantidad de visualizaciones de mayor a menor
        // productsByVisualizations = products.sort((a, b) => b.visualizations - a.visualizations).slice(0, 4);
        //console.log('Lista de productos por visualizaciones',productsByVisualizations);
        const isAuthenticated = req.user ? true : false;

        try {
            // Obtener productos en promoción (con descuento)
            const productsByPrice = await db.Producto.findAll({
                where: {
                    discount: { [Op.gt]: 0 } // Encuentra productos con descuento mayor que 0
                },
                order: [['discount', 'DESC']], // Ordena por descuento de mayor a menor
                limit: 4
            });
    
            // Obtener productos más visualizados
            const productsByVisualizations = await db.Producto.findAll({
                order: [['visualizations', 'DESC']], // Ordena por visualizaciones de mayor a menor
                limit: 4
            });
    
            res.render('index', { productsByPrice, productsByVisualizations, isAuthenticated });
        } catch (error) {
            console.log(error);
            res.status(500).json({error:'Error al cargar la página de inicio'});
        }
    },

    cart: function(req, res){
        res.render('productCart')
    }
}

module.exports = mainController;