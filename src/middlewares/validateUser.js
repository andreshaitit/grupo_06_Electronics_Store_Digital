// Importamos el módulo de Express Validator
const { body } = require('express-validator');

// Definimos las reglas de validación para el formulario de registro de usuarios
module.exports = [
    // Validación del campo "firstName" (nombre)
    body('firstName').notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 1, max: 30 }).withMessage('El nombre debe tener entre 1 y 30 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

    // Validación del campo "lastName" (apellido)
    body('lastName').notEmpty().withMessage('El apellido es requerido')
        .isLength({ min: 1, max: 30 }).withMessage('El apellido debe tener entre 1 y 30 caracteres')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),

    // Validación del campo "email" (correo electrónico)
    body('email').notEmpty().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('El correo electrónico debe ser válido'),

    // Validación del campo "password" (contraseña)
    body('password').notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
        .withMessage('La contraseña debe contener al menos una letra y un número')
        .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
        .withMessage('La contraseña debe contener al menos un carácter especial')
        .matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/)
        .withMessage('La contraseña debe contener una mezcla de letras en mayúscula y minúscula'),

    // Validamos que la contraseña coincida con la confirmación de contraseña
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }),

    // Validación del campo "image" (imagen de perfil)
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
];
