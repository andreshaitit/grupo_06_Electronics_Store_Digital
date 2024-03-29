//Se encarga de verificar si hay un usuario loggeado antes de mostrar una ventana protegida

function authMiddleware(req, res, next){
    if(!req.session.userLogged){
        return res.redirect('/user/login');
    }

    next();
}

module.exports = authMiddleware;