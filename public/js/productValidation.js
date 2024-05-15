//const { message } = require("statuses");

document.addEventListener("DOMContentLoaded", function() {

    const form = document.getElementById("productForm");
    const mark = document.querySelector("#mark");
    const name = document.querySelector("#name");
    const characteristics = document.querySelector("#characteristics");
    const price = document.querySelector("#price");
    const discount = document.querySelector("#discount");
    const warranty = document.querySelector("#warranty");
    const shipping = document.querySelector("#shipping");
    const stock = document.querySelector("#stock");
    const category = document.querySelector("#category");
    const state = document.querySelector("#state");
    const description = document.querySelector("#description");

    form.addEventListener('submit', function(e) {

        if(checkInputs()){
            alert("El producto se guardó satisfactoriamente");
        } else {
            e.preventDefault();
            alert("Tienes campos por completar");
        }
        
    })

    mark.addEventListener('input', () => {
        validateField(mark,
            (mark.value.trim() !== ''),
            'La marca es requerida');
    });

    name.addEventListener('input', () => {
        const nameInput = validateName(name.value);
        validateField(name,
            nameInput.msg === '',
            nameInput.msg);
    });

    characteristics.addEventListener('input', () => {
        const characteristicsInput = validateCharacteristics(characteristics.value);
        validateField(characteristics,
            characteristicsInput.msg === '',
            characteristicsInput.msg);
    });

    price.addEventListener('input', () => {
        const priceInput = validatePrice(price.value)
        validateField(price,
            priceInput.msg === '',
            priceInput.msg);
    });

    discount.addEventListener('input', () => {
        const discountInput = validateDiscount(discount.value)
        validateField(discount,
            discountInput.msg === '',
            discountInput.msg);
    });

    warranty.addEventListener('input', () => {
        const warrantyInput = validateWarranty(warranty.value)
        validateField(warranty,
            warrantyInput.msg === '' ,
            warrantyInput.msg);
    });

    shipping.addEventListener('input', () => {
        validateField(shipping, (shipping.value.trim() !== ""), 'El tipo de envio es requerido');
    });

    stock.addEventListener('input', () => {
        const stockInput = validateStock(stock.value)
        validateField(stock,
            stockInput.msg === '',
            stockInput.msg);
    });

    category.addEventListener('input', () => {
        validateField(category, (category.value.trim() !== ""), 'La categoria es requerida');
    })

    state.addEventListener('input', () => {
        validateField(state, (state.value.trim() !== ""), 'El estado del producto es requerido');
    })

    description.addEventListener('input', () => {
        const descriptionInput = validateDescription(description.value)
        validateField(description,
            descriptionInput.msg === '',
            descriptionInput.msg);
    });

    function checkInputs() {
        let isValid = true;
        
        validateField(mark, (mark.value.trim() !== ''), 'La marca es requerida');
        
        validateField(name,
            nameInput.msg === '',
            nameInput.msg);

        validateField(characteristics,
            characteristicsInput.msg === '',
            characteristicsInput.msg);

        validateField(price,
            priceInput.msg === '',
            priceInput.msg);

        validateField(discount,
            discountInput.msg === '',
            discountInput.msg);

        validateField(warranty,
            warrantyInput.msg === '' ,
            warrantyInput.msg);

        validateField(shipping, (shipping.value.trim() !== ""), 'El tipo de envio es requerido');
        
        validateField(stock,
            stockInput.msg === '',
            stockInput.msg);

        validateField(category, (category.value.trim() !== ""), 'La categoria es requerida');

        validateField(state, (state.value.trim() !== ""), 'El estado del producto es requerido');
        
        validateField(description,
            descriptionInput.msg === '',
            descriptionInput.msg);

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

    function validateCharacteristics(characteristics) {
        // Comprobar si las características están vacías
        if (characteristics.trim() === '') {
            return {
                msg: 'Las características son requeridas',
            };
        }

        // Comprobar longitud de las características
        if (characteristics.length > 1000) {
            return {
                msg: 'Las características no pueden tener más de 1000 caracteres',
            };
        }
        return {
            msg: '',
        };
    }
    
    function validatePrice(price){
        // Comprobar si el precio está vacío
        if (price.trim() === '') {
            return {
                msg: 'El precio es requerido',
            };
        }
        // Comprobar si el precio es un número decimal válido
        /*if (!/^\d+(\.\d{1,2})?$/.test(price)) {
            return {
                msg: 'El precio debe ser un número decimal válido',
            };
        }*/
        // Comprobar si el precio es mayor que cero
        if (parseFloat(price) <= 0) {
            return {
                msg: 'El precio debe ser mayor que cero',
            };
        }
        return {
            msg: '',
        };
    }

    function validateDiscount(discount){
        // Comprobar si el descuento es un número
        if (discount.trim() === '' && !Number.isInteger(parseInt(discount))) {
            return {
                msg: 'El descuento debe ser un número',
            };
        }

        // Comprobar si el descuento está dentro del rango
        if ((parseInt(discount) < 0 || parseInt(discount) > 100)) {     
            return {
                msg: 'El descuento debe encontrarse en el rango del 0% a 100%',
            };
        }
        return {
            msg: '',
        };
    }

    function validateWarranty(warranty) {
         // Validar si la garantía es un número entero
        if (warranty.trim() === '' && !Number.isInteger(parseInt(warranty))) {
            return {
                msg: 'La garantía debe ser un número entero',
            };
        }

        // Validar si la garantía es un número entero positivo
        if (parseInt(warranty) < 0) {
            return {
                msg: 'La garantía debe ser un número entero positivo',
            };
        }
        return {
            msg: '',
        };
    }

    function validateStock(stock) {
        // Validar si el stock está vacío
        if (stock.trim() === '') {
            return {
                msg: 'El stock del producto es requerido',
            };
        }

        // Validar si el stock es un número entero
        if (!Number.isInteger(parseInt(stock))) {
            return {
                msg: 'El stock debe ser un número entero',
            };
        }

        // Validar si el stock es mayor que cero
        if (parseInt(stock) <= 0) {
            return {
                msg: 'El stock debe ser mayor que cero',
            };
        }
        return {
            msg: '',
        };
    }

    function validateDescription(description) {
        // Validar longitud de la descripción
        if (description.trim().length < 20 || description.trim().length > 3000) {
            return {
                msg: 'La descripción debe tener entre 20 y 3000 caracteres',
            };
        }
        return {
            msg: '',
        };
    }

});