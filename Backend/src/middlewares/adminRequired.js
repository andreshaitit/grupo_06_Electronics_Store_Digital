//Se encarga de verificar si el usuario es un administrador

function authMiddleware(req, res, next){
    if(!req.user.category){
        return res.redirect('/user/login');
    }

    next();
}

module.exports = authMiddleware;