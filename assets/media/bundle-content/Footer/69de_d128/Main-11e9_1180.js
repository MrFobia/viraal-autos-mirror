/* --- (Aquí va tu clase RestrictedInput sin cambios) --- */
class RestrictedInput {
    constructor(elem) {
        this.input = elem;
        this.validationType = this.input.dataset.validation;
        this.functionPairing = {
            'only-letters': this.inputOnlyLetters,
            'only-numbers': this.inputOnlyNumbers,
        };
        this.input.addEventListener('input', this.handleInput);
    }
    handleInput = () => {
        if (this.functionPairing[this.validationType]) {
            this.input.value = this.functionPairing[this.validationType](this.input.value);
        }
    }
    inputOnlyNumbers(string) {
        var out = '';
        var filtro = '1234567890.';
        for (var i = 0; i < string.length; i++)
            if (filtro.indexOf(string.charAt(i)) != -1)
                out += string.charAt(i);
        return out;
    }
    inputOnlyLetters(string) {
        var out = '';
        var filtro = 'abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZáéíóú´ÁÉÍÓÚ ';
        for (var i = 0; i < string.length; i++)
            if (filtro.indexOf(string.charAt(i)) != -1)
                out += string.charAt(i);
        return out;
    }
}
/* --- FIN de la clase RestrictedInput --- */

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Obtiene la fecha de hoy
    const today = new Date();
    
    // 2. Formatea la fecha al formato requerido (YYYY-MM-DD)
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexado (0=Enero)
    const dd = String(today.getDate()).padStart(2, '0');
    
    const minDate = `${yyyy}-${mm}-${dd}`;
    
    // 3. Selecciona tu input por su ID y asigna la fecha mínima
    const dateInput = document.getElementById('validationDateAppoiment');
    
    // Verificamos que el input exista antes de asignarle el valor
    if (dateInput) {
        dateInput.min = minDate;
    }
});

/* --- INICIALIZACIÓN Y VALIDACIÓN DE BOOTSTRAP (CORREGIDA) --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicializa tu clase RestrictedInput (como antes)
    const inputsToValidate = document.querySelectorAll('input[data-validation]');
    inputsToValidate.forEach(input => {
        new RestrictedInput(input);
    });

    
    // 2. Lógica de validación de Bootstrap MEJORADA
    
    // Seleccionamos el input específico por su 'name'
    const docNumberInput = document.querySelector('input[name="documentNumber"]');

    if (docNumberInput) {
        
        // Buscamos el div de feedback que es hermano o está cerca
        const parentCol = docNumberInput.closest('div'); // El .col-12
        const feedbackDiv = parentCol ? parentCol.querySelector('.invalid-feedback') : null;

        if (!feedbackDiv) {
            console.error("No se encontró el .invalid-feedback para el input documentNumber");
            return;
        }

        // Guardamos los posibles mensajes de error
        const msgRequired = "El campo número de documento es requerido.";
        const msgMinLength = `El campo debe tener al menos ${docNumberInput.minLength} dígitos.`;

        // Función que revisa la validez y aplica clases Y MENSAJES
        const validateBootstrapField = (input) => {
            const value = input.value;
            const minLength = input.minLength; // Obtiene el 5 del HTML
            const isRequired = input.required;

            // REGLA 1: Está vacío Y es requerido
            if (isRequired && value.length === 0) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                feedbackDiv.textContent = msgRequired; // Mensaje de "requerido"
            
            // REGLA 2: Tiene valor, PERO es menor al mínimo
            } else if (minLength > 0 && value.length > 0 && value.length < minLength) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                feedbackDiv.textContent = msgMinLength; // Mensaje de "minlength"
            
            // REGLA 3: Es VÁLIDO
            } else {
                // Solo lo marcamos como válido si tiene contenido
                // (para que no se ponga verde un campo opcional vacío)
                if (value.length > 0) {
                     input.classList.add('is-valid');
                     input.classList.remove('is-invalid');
                } else {
                    // Si está vacío y no es requerido, simplemente limpiamos las clases
                    input.classList.remove('is-valid');
                    input.classList.remove('is-invalid');
                }
            }
        };

        // 3. Asignar los eventos
        docNumberInput.addEventListener('input', () => {
            validateBootstrapField(docNumberInput);
        });

        docNumberInput.addEventListener('blur', () => {
            validateBootstrapField(docNumberInput);
        });
    }
});

function initAllSwipers(){ 
    
    
    
    const swiperCarsFeatured = new Swiper('[data-swiper=js-swiper-carsFeatured]', {
       
        slidesPerView: 1,
        slidesPerGroup: 1,
        autoplay: false,
        spaceBetween: 18,
        navigation: {
            nextEl: '[data-navigation="js-swiper-carsFeatured-next"]',
            prevEl: '[data-navigation="js-swiper-carsFeatured-prev"]',
        },
      
        breakpoints: {
          
            992: {
                slidesPerView: 3,
                slidesPerGroup: 3, 
                spaceBetween: 18
            },
           
            1200: {
                slidesPerView: 4,
                slidesPerGroup: 4, 
                spaceBetween: 18
            },
          
            1400: {
                slidesPerView: 4,
                slidesPerGroup: 4, 
                spaceBetween: 18
            },
            
            1600: {
                slidesPerView: 4,
                slidesPerGroup: 4, 
                spaceBetween: 18
            }
        }
    });

    const swiperTestimonials = new Swiper('[data-swiper=js-swiper-Testimonials]', {
        slidesPerView: "auto", 
        autoplay: false,
        loop: true,
        spaceBetween: 30,
        centeredSlides: true,
        navigation: {
            nextEl: '[data-navigation="js-swiper-Testimonials-next"]',
            prevEl: '[data-navigation="js-swiper-Testimonials-prev"]',
        },
        pagination: {
            el: '[data-pagination="js-swiper-Testimonials-pagination"]',
            clickable: true,
            dynamicBullets: true,
        },
        on: {
            init: function () {
                if (this.slides.length <= 3) {
                    this.navigation.nextEl.style.display = 'none';
                    this.navigation.prevEl.style.display = 'none';
                }
            }
        },
        breakpoints: {
            768: {
                spaceBetween: 45,
            },
            991: {
                spaceBetween: 35,
                // slidesPerView: 3,
                // slidesPerGroup: 3,
            },
            1199: {
                spaceBetween: 12,
                // slidesPerView: 3,
                // slidesPerGroup: 3,
            },
            1599: {
                spaceBetween: 95,
                // slidesPerView: 3,
                // slidesPerGroup: 3,
            }
        }
    });
    
    const productThumsInner = new Swiper('[data-swiper=js-swiper-product-thumbs]', {
        spaceBetween: 10,
        slidesPerView: 5,
        freeMode: true,
        watchSlidesProgress: true,
    });
    const productDetailInner = new Swiper('[data-swiper=js-swiper-product-detail]', {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
            el: "[data-pagination=js-swiper-product-detail-pagination]",
            type: "fraction",
        },
        navigation: {
            nextEl: '[data-navigation="js-swiper-product-detail-right"]',
            prevEl: '[data-navigation="js-swiper-product-detail-left"]',
        },
        thumbs: {
            swiper: productThumsInner,
        },
    });
    
    const swiperTabsBrands = new Swiper('[data-swiper=js-swiper-TabsBrands]', {
        slidesPerView: "auto",
        spaceBetween: 16,
    });
   

}

function togglePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.toggle('active');
}

function brandsModelsFilter(){
    const marcaSelect = document.getElementById('vehicleBrand');
    const modeloContainer = document.querySelector('#vehicleModel').closest('.nice-select-custom');

    // Control del select de modelo
    if (marcaSelect && modeloContainer) {
        // Inicialmente deshabilitado
        modeloContainer.classList.add('model-disabled');

        marcaSelect.addEventListener('change', function() {
            if (this.value && this.value !== "") {
                modeloContainer.classList.remove('model-disabled');
            } else {
                modeloContainer.classList.add('model-disabled');
                // Opcional: Resetear el valor del modelo
                document.getElementById('vehicleModel').value = "";
            }
        });
    }
}
function setupClearButtons() {
    const clearButtons = document.querySelectorAll('.vehica-search__field .clear-times, .filter-item .clear-times');
    
    clearButtons.forEach(button => {
        button.classList.add('d-none');
    });

    function toggleClearButton(select) {
        const clearButton = select.closest('.vehica-search__field, .filter-item').querySelector('.clear-times');
        if (select.value && select.value !== "") {
            clearButton.classList.remove('d-none');
        } else {
            clearButton.classList.add('d-none');
        }
    }

    clearButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const container = this.closest('.vehica-search__field, .filter-item');
            const select = container.querySelector('select');
            
            if (select) {
                select.value = "";
                toggleClearButton(select);
                
                const event = new Event('change');
                select.dispatchEvent(event);
                
                if (select.id === 'vehicleBrand') {
                    document.querySelectorAll('#vehicleModel').forEach(modelSelect => {
                        modelSelect.value = "";
                        toggleClearButton(modelSelect);
                    });
                }
            }
        });
    });

    document.querySelectorAll('.vehica-search__field select, .filter-item select').forEach(select => {
        
        toggleClearButton(select);
        
       
        select.addEventListener('change', function() {
            toggleClearButton(this);
            
            if (this.id === 'vehicleBrand' && this.value && this.value !== "") {
               
            }
        });
    });
}



function moreFilters(){
    const toggleButton = document.querySelector('.more-filters-button');
    const moreFilters = document.querySelector('.more-filters');
    
    if (toggleButton && moreFilters) {
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            moreFilters.classList.toggle('active');
            this.innerHTML  = moreFilters.classList.contains('active') 
                ? `<span class='icon fa fa-chevron-up'></span> Menos filtros` 
                : `<span class='icon fa fa-chevron-down'></span> Más filtros`;
        });
    }
}



function seeMoreDescription(){
    const description = document.querySelector('.vehica-car-description');
    const button = document.querySelector('.vehica-show-more-btn');
    const content = document.querySelector('.vehica-car-description__inner');
    
    if(description){
        // Verificar que todos los elementos existen
        if (!description || !button || !content) {
            console.error('No se encontraron los elementos necesarios');
            return;
        }
        
        // Solo mostrar el botón si el contenido es más alto que 100px
        if (content.scrollHeight <= 100) {
            button.style.display = 'none';
        }
        
        button.addEventListener('click', function() {
            if (description.classList.contains('expanded')) {
                // Contraer
                description.classList.remove('expanded');
                description.style.maxHeight = '100px';
                button.textContent = 'Mostrar más';
            } else {
                // Expandir
                description.classList.add('expanded');
                description.style.maxHeight = content.scrollHeight + 'px';
                button.textContent = 'Mostrar menos';
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () =>  {
    seeMoreDescription();
});


// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

document.addEventListener('DOMContentLoaded', function () {
    // Seleccionamos todos los contenedores que agrupan un input y un botón.
    // Usamos '.filter-item .col-6' para ser específicos.
    const inputContainers = document.querySelectorAll('.filter-item .col-6');

    // Ocultamos los botones al inicio por si tuvieran algún valor precargado
    // que no fuera detectado por el evento 'input'.
    inputContainers.forEach(container => {
        const input = container.querySelector('.input-primary');
        const clearButton = container.querySelector('.clear-times-min-max');
        if (input && clearButton) {
            clearButton.style.display = 'none';
        }
    });

    // Recorremos cada contenedor para asignar los eventos.
    inputContainers.forEach(container => {
        const input = container.querySelector('.input-primary');
        const clearButton = container.querySelector('.clear-times-min-max');

        // Nos aseguramos de que ambos elementos (input y botón) existan.
        if (input && clearButton) {
            
            // 1. Evento para mostrar/ocultar el botón al escribir en el input.
            input.addEventListener('input', () => {
                // Si el input tiene texto, muestra el botón. Si está vacío, lo oculta.
                clearButton.style.display = input.value.length > 0 ? 'block' : 'none';
            });

            // 2. Evento para limpiar el input cuando se hace clic en el botón.
            clearButton.addEventListener('click', (event) => {
                // Prevenimos cualquier acción por defecto del botón.
                event.preventDefault(); 
                
                // Limpiamos el valor del input.
                input.value = ''; 
                
                // Ocultamos el botón nuevamente.
                clearButton.style.display = 'none'; 
                
                // Opcional: Devolvemos el foco al input para que el usuario pueda seguir escribiendo.
                input.focus(); 
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', () =>  {
    initAllSwipers();
    moreFilters();
    brandsModelsFilter()
    setupClearButtons();

    // initNiceSelect();
    
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleInput = document.getElementById('toggleUsedVehicleForm');
    
    if(toggleInput){
        
        const toggleText = toggleInput.nextElementSibling.querySelector('.switch-text');
    
        toggleInput.addEventListener('change', function() {
            if (this.checked) {
                // Estado activado
                toggleText.textContent = 'Sí';
            } else {
                // Estado desactivado
                toggleText.textContent = 'No';
            }
        });
        
    }
    
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');

    toggleIcons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input && input.tagName === 'INPUT') {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                this.classList.toggle('icon-eye');
                this.classList.toggle('icon-eye-closed');
            }
        });
    });
});
