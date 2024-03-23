const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


const productsFilePath = path.join(__dirname, '../data/products.json');
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const {validationResult} = require('express-validator');

const productsController = {

    // Root - Show all products
    list: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productList.ejs'));
        let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
        //console.log('Lista de productos',products);

         // Función de comparación aleatoria para el método sort
        function compareRandom() {
            return Math.random() - 0.5; // Devuelve un número positivo o negativo aleatorio
        }

        // Desordena el array de productos utilizando la función de comparación aleatoria
        products.sort(compareRandom);

        res.render('./products/productList',{products:products});
    },

    listByCategory: function(req,res){

        const productsByCategory = products.filter(p => p.category == req.params.category);

        if(productsByCategory){
            res.render('./products/productList',{products:productsByCategory});
        } else {
            res.send(`Error, no se encontraron productos para la categoria seleccionada`)
        }

    },

    // Detail - Detail from one product
    detail: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productDetail.ejs'));

        const product = products.find(p => p.id == req.params.id);

        if(product){
            res.render('./products/productDetail',{product: product});
        } else {
            res.send(`Error, no se encontro el producto con id: ${req.params.id}`)
        }
        
    },

    // Create - Form to create
    create: function(req,res){
        res.render('./products/productCreate');
    },

    // Create -  Method to list of products
    keep: function(req, res){

        //let result = validationResult(req)

        if(true){
            const newProduct = {
                id: uuidv4(), //para generar IDs únicos basados en estándares universales.
                name: req.body.name,
                mark: req.body.mark,
                characteristics: req.body.characteristics,
                price: req.body.price,
                discount: req.body.discount,
                warranty: req.body.warranty,
                shipping: req.body.shipping,
                stock: req.body.stock,
                category: req.body.category,
                state: req.body.state,
                description: req.body.description,
                visualizations: 0,
                image: req.file?.filename || "/images/products/default-image.png"
            }

            //Agregmos el nuevo producto al listado
			products.push(newProduct);
            //Convertimos a json el objeto javascript
			let productsJSON = JSON.stringify(products, null, ' ');
            //Procedimiento para cargarlo en el JSON
			fs.writeFileSync(productsFilePath, productsJSON)
            res.redirect('/product/list');
        } else{
            
            res.render('./products/productCreate',{
                old: req.body,
                error: result.mapped()
            })
        }
    },

    // Update - Form to edit
    edit: function(req,res){
        //Obtener los datos de producto a editar
        let productEdit = products.find(product => product.id == req.params.id);
        //Renderizar la vista con los datos
        if(productEdit){
            res.render('./products/productUpdate',{productEdit});
        } else {
            res.redirect(`/product/detail/${req.params.id}`)
        }
        
    },

    // Update - Method to update
    update: function(req,res){

        //Obtener los datos del producto a actualizar
		let id = req.params.id;
		let productUpdate = products.find(product => product.id == id)

		// Comprobar si hay una nueva imagen
		if (req.file) {
			// Eliminar la imagen anterior
			fs.unlinkSync(path.join(__dirname,'../../public/images/products/',productUpdate.image))
			// Asignar la nueva imagen al producto
			productUpdate.image = req.file.filename;
		}

		//Modificamos el producto
		if(productUpdate){
            productUpdate.mark = req.body.mark || productUpdate.mark
			productUpdate.name = req.body.name || productUpdate.name
            productUpdate.characteristics = req.body.characteristics || productUpdate.characteristics
			productUpdate.price = req.body.price || productUpdate.price
			productUpdate.discount = req.body.discount || productUpdate.discount
            productUpdate.warranty = req.body.warranty || productUpdate.warranty
            productUpdate.shipping = req.body.shipping || productUpdate.shipping
            productUpdate.stock = req.body.stock || productUpdate.stock
			productUpdate.category = req.body.category || productUpdate.category
            productUpdate.state = req.body.state || productUpdate.state
			productUpdate.description = req.body.description || productUpdate.description

			//Convertir a JSON y re-escribir el json de productos
			fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2))
			//El tercer parametro, es decir el 2, representa la identacion

			res.redirect(`/product/detail/${req.params.id}`)

		}else {
			res.redirect('/product/list')
		}
    },
    
    // Delete - Delete one product from DB
    delete: function(req,res){

        //Obtener el id del producto
		let id = req.params.id;
        //Quitar la imagen
		const productToDelete = products.find(product => product.id == id)
        if (productToDelete.image != 'default-image.png') {
			fs.unlinkSync(path.join(__dirname,'../../public/images/products/',productToDelete.image))
		}
        //Quitar producto deseado
		products = products.filter(product => product.id != id)
        //Convertimos a jason el objeto a javascript
        let productsJSON = JSON.stringify(products, null, ' ');
        //Procedimiento para cargarlo en el JSON
		fs.writeFileSync(productsFilePath, productsJSON)

        res.redirect('/product/list');
    }
}

module.exports = productsController;