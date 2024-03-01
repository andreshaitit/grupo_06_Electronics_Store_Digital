//Se encarga de verificar si hay un usuario loggeado antes de mostrar el perfil

function authMiddleware(req, res, next){
    if(!req.session.userLogged){
        return res.redirect('/user/login');
    }

    next();
}

module.exports = authMiddleware;