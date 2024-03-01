//Se encarga de verificar si hay un usuario loggeado

function guestMiddleware(req, res, next){
    if(req.session.userLogged){
        return res.redirect('/user/profile');
    }

    next();
}

module.exports = guestMiddleware;