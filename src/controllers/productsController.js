const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/models')
const sequelize = require('sequelize');
const Op = db.Sequelize.Op;
const productsFilePath = path.join(__dirname, '../data/products.json');
//let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const {validationResult} = require('express-validator')
//const { log, error } = require('console');

// Función para eliminar la imagen anterior
async function deleteOldImage(imageName) {
    if (imageName !== 'default-image.png') {
        fs.unlinkSync(path.join(__dirname, '../../public/images/products/', imageName));
    }
}

async function brandsByCategory(category){
    try {
        // Consulta para obtener las marcas de los productos según una categoría dada
        
        // Ejecutar la consulta utilizando el modelo Producto
        const brandsByCategory = await db.Producto.findAll({
            // Seleccionar las columnas de marca y contar el número de productos por marca
            attributes: [
                [sequelize.literal('brand.id'), 'id'],
                [sequelize.literal('brand.name'), 'nombre'],
                [sequelize.fn('COUNT', sequelize.col('brand.name')), 'cantidad']
            ],
            // Incluir las asociaciones con la marca y la categoría
            include: [
                {
                    association: "brand", // Incluir la asociación con la marca
                    attributes: [] // No seleccionar ninguna columna adicional de la marca
                },
                { 
                    association: "category", // Incluir la asociación con la categoría
                    attributes: [], // No seleccionar ninguna columna adicional de la categoría
                    where: { name: category } // Filtrar por el nombre de la categoría proporcionado en la solicitud
                }
            ],
            // Agrupar por el nombre e ID de la marca para contar correctamente el número de productos por marca
            group: ['brand.name', 'brand.id'] 
        });

        if (brandsByCategory.length > 0) {
            return brandsByCategory.map(producto => ({
                id: producto.dataValues.id,
                nombre: producto.dataValues.nombre,
                cantidad: producto.dataValues.cantidad
            }));
        } else {
            throw new Error('No se encontraron marcas para esta categoría');
        }
    } catch (error) {
        throw error;
    }
}

const productsController = {

    // Root - Show all products
    /*list: function(req,res){
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
    },*/

    list: async (req, res) => {
        try {
            let products = await db.Producto.findAll();
    
            if (!products || products.length === 0) {
                return res.status(404).json({ error: "No se encontraron productos" });
            }
    
            // Función de comparación aleatoria para el método sort
            function compareRandom() {
                // Devuelve un número positivo o negativo aleatorio
                return Math.random() - 0.5; 
            }
    
            // Desordena el array de productos utilizando la función de comparación aleatoria
            products.sort(compareRandom);

            const categories = await db.Categoria.findAll()
    
            res.render('./products/productList', { products: products, categories: categories });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error al buscar productos" });
        }
    },    // FUNCIONAL
    
    // listar productos *********************************************************************************
    /*listByCategory: function(req,res){

        const productsByCategory = products.filter(p => p.category == req.params.category);

        if(productsByCategory.length > 0){
            res.render('./products/productList',{products:productsByCategory});
        } else {
            res.render('./products/productList',{products:productsByCategory,
                keywords:req.params.category ,
            error: {
                msg: 'No se encontraron productos para está categoria'
            }});
        }

    },*/

    listByCategory: async (req, res) => {
        try {
            const productsByCategory = await db.Producto.findAll({
                include: [{ association: "brand" }, { association: "category" },],
                where: { '$category.name$': req.params.category }
            });
    
            //return res.json(productsByCategory);
            if(productsByCategory.length > 0){
                const brands = await brandsByCategory(req.params.category)
                res.render('./products/productList',{products:productsByCategory, keywords:req.params.category, brand:brands});
            } else {
                res.render('./products/productList',{products:productsByCategory,
                    keywords:req.params.category ,
                error: {
                    msg: 'No se encontraron productos para está categoria'
                }});
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error al buscar productos por categoría" });
        }
    },  // FUNCIONAL

    /* DETERMINAR LAS MARCAS Y LA CANTIDAD DE PRODUCTOS SEGUN LA CATEGORIA ********************************
    select b.name as marca, count(b.name) as numero_productos from products as p join
        categories as c on p.id_category = c.id join
        brands as b on p.id_brand= b.id
        where c.name = 'NOTEBOOK'
        group by b.name;

        const brandsByCategory = await db.Categoria.findAll({
                        attributes: [
                            'name',
                            [sequelize.fn('COUNT', sequelize.col('products.id_category')), 'numero_productos']
                        ],
                        include: [
                            {
                                model: db.Producto,
                                as: 'products',
                                attributes: [],
                                required: false
                            }
                        ],
                        group: ['Categoria.name','Categoria.id']
        });
            

    */
     
    listBrandsByCategory: async (req, res) => {
        try {
            // Consulta para obtener las marcas de los productos según una categoría dada
    
            // Ejecutar la consulta utilizando el modelo Producto
            const brandsByCategory = await db.Producto.findAll({
                // Seleccionar las columnas de marca y contar el número de productos por marca
                attributes: [
                    [sequelize.literal('brand.name'), 'marca'],
                    [sequelize.fn('COUNT', sequelize.col('brand.name')), 'numero_productos']
                ],
                // Incluir las asociaciones con la marca y la categoría
                include: [
                    {
                        association: "brand", // Incluir la asociación con la marca
                        attributes: [] // No seleccionar ninguna columna adicional de la marca
                    },
                    { 
                        association: "category", // Incluir la asociación con la categoría
                        attributes: [], // No seleccionar ninguna columna adicional de la categoría
                        where: { name: req.params.category } // Filtrar por el nombre de la categoría proporcionado en la solicitud
                    }
                ],
                // Agrupar por el nombre e ID de la marca para contar correctamente el número de productos por marca
                group: ['brand.name', 'brand.id'] 
            });
    
            // Verificar si se encontraron marcas para la categoría dada
            if (brandsByCategory.length > 0) {
                // Devolver los resultados como JSON si se encontraron marcas
                return res.json(brandsByCategory);
            } else {
                // Devolver un mensaje de error si no se encontraron marcas para la categoría dada
                return res.status(404).json({ error: 'No se encontraron marcas para esta categoría' });
            }
        } catch (error) {
            // Capturar y manejar cualquier error que ocurra durante la ejecución de la consulta
            console.log(error);
            return res.status(500).json({ error: 'Error al buscar marcas por categoría' });
        }
    },                
    
    // Impmenent search for products *******************************************************************
    /*search: (req, res) => {

        //Obtenemos la informacion del formulario
        let keyword = req.query.keywords;

        //Filtramos los productos con la palabra buscada
        let resultSearch = products.filter(product =>{
            return product.name.toLowerCase().includes(keyword.toLowerCase());
        })

        if (resultSearch.length > 0){
            res.render('./products/productList',{products: resultSearch, keywords: keyword});
        }
        else {
            res.render('./products/productList',{products: resultSearch, keywords: keyword,
            error:{
                msg: 'No se encontraron productos que coincidan con tu busqueda'
            }})
        }
    },*/

    search: async (req, res) => {
        try {
            // Validar la existencia de palabras clave antes de realizar la búsqueda
            const keywords = req.query.keywords;
            if (!keywords) {
                return res.status(400).json({ error: 'Se requiere una palabra clave para realizar la búsqueda' });
            }
            //Buscar los productos que coincidan con la busqueda
            const resultSearch = await db.Producto.findAll({
                where: {
                    name: { [Op.like]: `%${keywords}%` }
                }
            });
            
            //Renderizar la vista con los productos encontrados
            if (resultSearch.length > 0) {
                res.render('./products/productList', { products: resultSearch, keywords: keywords });
            } else {
                res.render('./products/productList', { products: resultSearch, keywords: keywords, error: { msg: 'No se encontraron productos que coincidan con tu búsqueda' } });
            }
    
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },    // FUNCIONAL

    // Detail - Detail from one product ****************************************************************
    /*detail: function(req,res){
        //res.sendFile(path.join(__dirname,'../views/productDetail.ejs'));

        const product = products.find(p => p.id == req.params.id);

        if(product){
            res.render('./products/productDetail',{product: product});
        } else {
            res.send(`Error, no se encontro el producto con id: ${req.params.id}`)
        }
        
    },*/
    
    detail: async (req, res) => {
        try {
            let result = await db.Producto.findByPk(req.params.id, {
                include: [{ association: "brand" }, { association: "category" }, { association: "state" }]
            });
            
            if (!result) {
                return res.status(404).json({ error: `No se encontró el producto con ID ${req.params.id}` });
            }
    
            // Renderizar la vista del detalle del producto
            res.render('./products/productDetail', { product: result });
    
            // Incrementar las visualizaciones de manera asincrónica
            db.Producto.increment('visualizations', { 
                by: 1, 
                where: { id_product: req.params.id } 
            });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },    // FUNCIONAL
    
    // Create - Form to create *************************************************************************
    /*create: function(req,res){
        res.render('./products/productCreate');
    },*/

    create: async (req,res) => {
        try{
            const categorias = await db.Categoria.findAll()
            const estados = await db.EstadoProducto.findAll()
            const marcas = await db.Marca.findAll()
            
            //res.json({categorias: categorias, estados: estados});
            res.render('./products/productCreate',{marcas,categorias,estados});
        } catch (error){
            console.log(error);
            return res.status(500).json({ error:"Error interno del servidor" });
        }
    },  // FUNCIONAL

    // Create -  Method to list of products *************************************************************
    /*keep: function(req, res){

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
    },*/

    keep: async (req, res) =>{

        try{
            let result = validationResult(req)

            if(result.isEmpty()){

                await db.Producto.create({
                    id_product: uuidv4(), //para generar IDs únicos basados en estándares universales.
                    name: req.body.name,
                    id_brand: req.body.mark, //debe buscar si ya existe la marca pata guardar el id.
                    characteristics: req.body.characteristics,
                    price: req.body.price,
                    discount: req.body.discount,
                    warranty: req.body.warranty,
                    shipping: req.body.shipping,
                    stock: req.body.stock,
                    id_category: req.body.category,
                    id_state: req.body.state,
                    description: req.body.description,
                    visualizations: 0,
                    image: req.file?.filename || "default-image.png"
                })

                res.redirect('/product/list');

            } else{
                
                return res.status(404).json({
                    old: req.body,
                    error: result.mapped()
                })
            }
        }catch (error) {
            console.log(error);
            res.status(500).json({error:'Error interno del servidor'});
        }
    },

    // Update - Form to edit ****************************************************************************
    /*edit: function(req,res){
        //Obtener los datos de producto a editar
        let productEdit = products.find(product => product.id == req.params.id);
        //Renderizar la vista con los datos
        if(productEdit){
            res.render('./products/productUpdate',{productEdit});
        } else {
            res.redirect(`/product/detail/${req.params.id}`)
        }
        
    },*/

    edit: async (req, res) => {
        try {
            // Obtener los datos del producto a editar
            let productEdit = await db.Producto.findByPk(req.params.id);
            const categorias = await db.Categoria.findAll();
            const estados = await db.EstadoProducto.findAll();
            const marcas = await db.Marca.findAll();
    
            // Renderizar la vista con los datos
            if (productEdit) {
                res.render('./products/productUpdate', { productEdit, marcas, estados, categorias });
            } else {
                res.status(404).json({error:'El producto no se encontró'});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error:'Error interno del servidor'});
        }
    },    // FUNCIONAL

    // Update - Method to update ************************************************************************
    /*update: function(req,res){

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
    },*/

    update: async (req, res) => {
        try {

            let result = validationResult(req)

        if(result.isEmpty()){
            // Obtener los datos del producto a actualizar
            const productUpdate = await db.Producto.findByPk(req.params.id);
    
            if (!productUpdate) {
                return res.redirect('/product/list');
            }
    
            // Comprobar si hay una nueva imagen
            if (req.file) {
                await deleteOldImage(productUpdate.image);
                productUpdate.image = req.file.filename;
            }
    
            // Modificar el producto solo con los campos proporcionados
            await productUpdate.update({
                name: req.body.name || productUpdate.name,
                id_brand: req.body.mark || productUpdate.mark,
                characteristics: req.body.characteristics || productUpdate.characteristics,
                price: req.body.price || productUpdate.price,
                discount: req.body.discount || productUpdate.discount,
                warranty: req.body.warranty || productUpdate.warranty,
                shipping: req.body.shipping || productUpdate.shipping,
                stock: req.body.stock || productUpdate.stock,
                id_category: req.body.category || productUpdate.category,
                id_state: req.body.state || productUpdate.state,
                description: req.body.description || productUpdate.description,
            });
    
            res.redirect(`/product/detail/${req.params.id}`);
        
        } else{
            
            return res.status(404).json({
                old: req.body,
                error: result.mapped()
            })
        }
        } catch (error) {
            console.log(error);
            res.status(500).json({error:'Error interno del servidor'});
        }
    },
    
    // Delete - Delete one product from DB **************************************************************
    /*delete: function(req,res){

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
    }*/

    delete: async (req, res) => {
        try {
            const productToDelete = await db.Producto.findByPk(req.params.id);
            
            if (!productToDelete) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
    
            // Verificar si la imagen no es la predeterminada antes de intentar eliminarla
            if (productToDelete.image !== 'default-image.png') {
                try {
                    // Eliminar la imagen del servidor
                    fs.unlinkSync(path.join(__dirname, '../../public/images/products/', productToDelete.image));
                } catch (error) {
                    // Manejar el error específico de eliminación de imagen
                    console.log(`Error al eliminar la imagen del producto: ${error.message}`);
                    return res.status(500).json({ error: 'Error interno del servidor al eliminar la imagen' });
                }
            }
    
            // Eliminar el producto de la base de datos
            await db.Producto.destroy({
                where: {
                    id_product: req.params.id
                }
            });
    
            res.redirect('/product/list');
        } catch (error) {
            console.log(`Error al eliminar el producto: ${error.message}`);
            res.status(500).json({ error: 'Error interno del servidor al eliminar el producto' });
        }
    }
    
}

module.exports = productsController;