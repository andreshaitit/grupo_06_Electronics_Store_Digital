const {body} = require('express-validator')

module.exports = [

    //Validacion de campos en el formulario

    body('name').notEmpty().withMessage('Debe tener un nombre').bail()
    .isLength({min: 1, max:40}).withMessage('El nombre debe contener de 1 a 40 caracteres'),
    body('price').notEmpty().withMessage('Debe tener un precio')
    .isNumeric().withMessage('El precio debe ser un número válido')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('discount').notEmpty().withMessage('Debe tener un descuento')
    .isNumeric().withMessage('El descuento debe ser un número válido')
    .isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
    body('category').notEmpty().withMessage('Debe seleccionar una categoría'),
    body('description').notEmpty().withMessage('Debe tener una descripcion')
    .isString().withMessage('La descripción debe ser un texto'),
    // Validación de la imagen
    body('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Debe subir una imagen');
        }
        // Verificar el tipo de archivo
        const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedFormats.includes(req.file.mimetype)) {
            throw new Error('Formato de imagen no válido. Debe ser JPEG, PNG o GIF');
        }
        // Verificar el tamaño del archivo (por ejemplo, máximo 5 MB)
        const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
        if (req.file.size > maxSize) {
            throw new Error('La imagen es demasiado grande. El tamaño máximo permitido es de 5 MB');
        }
        return true; // La validación pasó
    }),
]
