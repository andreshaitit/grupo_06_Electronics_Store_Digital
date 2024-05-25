document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("registerForm");
    const firstName = document.querySelector("#firstName");
    const lastName = document.querySelector("#lastName");
    const email = document.querySelector("#email");
    const password = document.querySelector("#password");
    const password2 = document.querySelector("#passwordConfirmation");

    /*
    form.addEventListener('submit', function(e) {

        if(checkInputs()){
            alert("El producto se guardó satisfactoriamente");
        } else {
            e.preventDefault();
            alert("Tienes campos por completar");
        }

    })*/

    // MANEJO DE EVENTOS EN TODOS LOS INPUTS

    firstName.addEventListener('input', () => {
        const nameInput = validateName(firstName.value);
        validateField(firstName,
            nameInput.msg === '',
            nameInput.msg);
    });

    lastName.addEventListener('input', () => {
        const nameInput = validateName(lastName.value);
        validateField(lastName,
            nameInput.msg === '',
            nameInput.msg);
    });

    email.addEventListener('input', () => {
        const nameInput = validateName(email.value);
        validateField(email,
            nameInput.msg === '',
            nameInput.msg);
    });

    password.addEventListener('input', () => {
        const nameInput = validateName(password.value);
        validateField(password,
            nameInput.msg === '',
            nameInput.msg);
    });

    password2.addEventListener('input', () => {
        const nameInput = validateName(password2.value);
        validateField(password2,
            nameInput.msg === '',
            nameInput.msg);
    });

    // FUNCIONES EMPLEADAS EN LOS EVENTOS

    function checkInputs() {
        let isValid = true;

        validateField(name,
            nameInput.msg === '',
            nameInput.msg);

        document.querySelectorAll('.form-control').forEach((control) => {
            if (control.classList.contains('is-invalid')) {
                isvalid = false;
            }
        });

        return isValid
    }

    function validateField(input, condition, errorMessage) {

        if(condition) {
            //Si no hay un mensaje de error
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }else{
            //En caso de que exista un mensaje de error
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
    }

    // VALIDACIONES DE LAS DIFERENTES ENTRADAS

    function validateName(name) {
        // Comprobar si el nombre está vacío
        if (name.trim() === '') {
            return {
                msg: 'El nombre es requerido',
            };
        }
        // Comprobar longitud del nombre
        if (name.length < 5 || name.length > 200) {
            return {
                msg: 'El nombre puede tener entre 5 y 200 caracteres',
            };
        }
        return {
            msg: '',
        };
    }

});