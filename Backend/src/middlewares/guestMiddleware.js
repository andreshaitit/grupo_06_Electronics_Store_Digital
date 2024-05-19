//Se encarga de verificar si hay un usuario loggeado, evitando que se pueda registrar o iniciar sesion con otra cuenta

function guestMiddleware(req, res, next){
    // si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
         return res.redirect("/user/profile");
    }
    // sino esta autenticado, permitir acceder a los formularios de login/register
    return next();
}

module.exports = guestMiddleware;