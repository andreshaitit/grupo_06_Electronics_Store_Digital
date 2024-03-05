//Se encarga de verificar si hay un usuario loggeado, evitando que se pueda registrar o iniciar sesion con otra cuenta

function guestMiddleware(req, res, next){
    if(req.session.userLogged){
        return res.redirect('/user/profile');
    }

    next();
}

module.exports = guestMiddleware;