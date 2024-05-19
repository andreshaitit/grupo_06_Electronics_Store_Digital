const path = require('path');

const usersControllers = {
    register: (req, res)=>{
        res.render('../views/register.ejs',{
            title:"Crea tu cuenta"
          })
    },
    login: (req, res)=>{
        res.render('../views/login.ejs',{
            title:"Inicia Sesion"
          })
    },
}
module.exports = usersControllers