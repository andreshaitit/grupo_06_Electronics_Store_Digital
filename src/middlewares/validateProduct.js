const {body} = require('express-validator')

module.exports = [

    //Validacion de campos en el formulario
    
    // (SELECCION) Validación del campo "mark" (marca)
    body('mark').notEmpty().withMessage('La marca es requerida'),

    // Validación del campo "name"
    body('name').notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 5, max: 200 }).withMessage('El nombre puede tener entre 5 y 200 caracteres'),

    // Validación del campo "characteristics" (características)
    body('characteristics').notEmpty().withMessage('Las características son requeridas')
        .isLength({ max: 1000 }).withMessage('Las características no pueden tener más de 1000 caracteres'),

    // Validación del campo "price" (precio)
    body('price').notEmpty().withMessage('El precio es requerido')
        .isDecimal({ decimal_digits: '10,2' }).withMessage('El precio debe ser un número decimal válido')
        .custom(value => {
            if (parseInt(value) <= 0) {
                throw new Error('El precio debe ser mayor que cero');
            }
            return true; // La validación pasó
        }),
        //.isDecimal({ decimal_digits: '10,2' }).withMessage('El precio debe ser un número decimal válido'),

    // Validación del campo "discount" (descuento)
    body('discount').optional({ nullable: true })
        .isInt().withMessage('El descuento debe ser un numero')
        .custom(value => {
            if ((parseInt(value) < 0) || (parseInt(value) >100)) {
                throw new Error('El descuento debe encontrarse en el rango del 0% a 100%');
            }
            return true; // La validación pasó
        }),
        //.isDecimal({ decimal_digits: '10,2' }).withMessage('El descuento debe ser un número decimal válido'),

    // Validación del campo "warranty" (garantía)
    body('warranty').optional({ nullable: true })
        .isInt().withMessage('La garantía debe ser un número entero'),

    // Validación del campo "shipping" (envío)
    body('shipping').optional({ nullable: true })
        .isBoolean().withMessage('El valor de envío debe ser verdadero o falso'),

    // Validación del campo "stock" (unidades disponibles)
    body('stock').notEmpty().withMessage('El stock del producto es requerido')
        .isInt().withMessage('El stock debe ser un número entero')
        .custom(value => {
            if (parseInt(value) <= 0) {
                throw new Error('El stock debe ser mayor que cero');
            }
            return true; // La validación pasó
        }),

    // (SELECCION) Validación del campo "category" (categoría)
    body('category').notEmpty().withMessage('La categoría es requerida')
        .isInt().withMessage('Debe seleccionar una categoria para el producto'),

    // (SELECCION) Validación del campo "state" (estado)
    body('state').notEmpty().withMessage('El estado es requerido')
        .isInt().withMessage('Debe seleccionar el estado para el producto'),

    // Validación del campo "description" (descripción)
    body('description').optional({ nullable: true })
        .isLength({min: 20 , max: 3000 }).withMessage('La descripción no puede tener más de 3000 caracteres'),

    // Validación del campo "visualizations" (visualizaciones)
    body('visualizations').optional({ nullable: true })
        .isInt().withMessage('Las visualizaciones deben representarse con un número entero'),

    // Validación del campo "image" (imagen)
    body('image').custom((value, { req }) => {
        if (req.file) {
            // Verificar el tipo de archivo
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedFormats.includes(req.file.mimetype)) {
                throw new Error('Formato de imagen no válido. Debe ser JPEG, JPG, PNG o GIF');
            }
            // Verificar el tamaño del archivo (por ejemplo, máximo 5 MB)
            const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
            if (req.file.size > maxSize) {
                throw new Error('La imagen es demasiado grande. El tamaño máximo permitido es de 5 MB');
            }
        }
        
        return true; // La validación pasó
    }),
]
