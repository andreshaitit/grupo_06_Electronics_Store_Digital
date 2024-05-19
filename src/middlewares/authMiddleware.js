//Se encarga de verificar si hay un usuario loggeado antes de mostrar una ventana protegida

function authMiddleware(req, res, next){    
    // si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
        }
        // sino esta autenticado, redirigir al formulario
        return res.redirect("/user/login");
}

module.exports = authMiddleware;