//Obtinene los datos de sesion del usuario a traves de la cookie

const users = require('../data/users.json')

function userLoggedMiddleware(req, res, next){
    //Suponemos que no hay ningun usuario logueado
    res.locals.isLogged = false;

    //En caso de existir una cookie de sesion, cargamos los datos del usuario
    let emailInCookie = req.cookies.userEmail
    let userFromCookie = users.find(user => user.email == emailInCookie);

    if(userFromCookie){
        delete userFromCookie.password; //Borramos la contraseña
        req.session.userLogged = userFromCookie;
    }

    //Verificamos que exista un usuario logueado
    if(req.isAuthenticated()){
        res.locals.isLogged = true;
        res.locals.userLogged = req.user;
    }

    next();
}

module.exports = userLoggedMiddleware;