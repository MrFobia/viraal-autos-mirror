// function initNiceSelect(){ 
//     //Initialize niceSelect2 library
//     const selects = [...document.querySelectorAll("select")];
//     const options = {searchable :false}
//     selects.map(select => {
//       NiceSelect.bind(select, options);
//     });
// }initNiceSelect();
function handleFixedHeader() {
      const header = document.querySelector('.header');
      const scrollThreshold = 80; 
      let isEnabled = false;
    
      function checkResolution() {
        return window.innerWidth > 1200;
      }
    
      function handleScroll() {
        const currentScrollPosition = window.pageYOffset;
        
        if (currentScrollPosition > scrollThreshold) {
          
          header.classList.add('header--fixed');
        } else {
          
          header.classList.remove('header--fixed');
        }
      }
    
      function toggleHeaderEffect() {
        if (checkResolution() && !isEnabled) {
         
          header.style.transition = 'top 0.4s ease-out';
          window.addEventListener('scroll', handleScroll);
          isEnabled = true;
          handleScroll(); 
        } else if (!checkResolution() && isEnabled) {
          window.removeEventListener('scroll', handleScroll);
          isEnabled = false;
          header.classList.remove('header--fixed');
          header.style.transition = '';
        }
      }
    
      toggleHeaderEffect();
      window.addEventListener('resize', toggleHeaderEffect);
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      handleFixedHeader();
    });
    
    
    
    function handleScroll() {
      const currentScrollPosition = window.pageYOffset;
      const body = document.body;
      
      if (currentScrollPosition > 0) {
        header.classList.add('header--fixed');
        body.classList.add('header-fixed-padding');
      } else {
        header.classList.remove('header--fixed');
        body.classList.remove('header-fixed-padding');
      }
    }
document.addEventListener('DOMContentLoaded', () =>  {
    handleFixedHeader();
});
function viewVehicles() {
    
    const gridContainer = document.querySelector('.vehica-inventory-v1__row-grid');
    const listViewBtn = document.getElementById('listViewBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');

    
    if (!gridContainer || !listViewBtn || !gridViewBtn) return;

   
    const savedView = localStorage.getItem('viewMode');


    if (savedView === 'list-view') {
        gridContainer.classList.remove('grid-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
      
        gridContainer.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }

 


    listViewBtn.addEventListener('click', function() {
        gridContainer.classList.remove('grid-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
 
        localStorage.setItem('viewMode', 'list-view');
    });

 
    gridViewBtn.addEventListener('click', function() {
        gridContainer.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');

        localStorage.setItem('viewMode', 'grid-view');
    });
}


viewVehicles();

function categoryButtonsActive() {
    const swiperContainers = document.querySelectorAll('.vehica-tabs');
    
    swiperContainers.forEach(container => {
        const categoryButtons = container.querySelectorAll('.vehica-tab');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const activeButton = container.querySelector('.vehica-tab.active');
                if (activeButton) activeButton.classList.remove('active');
                button.classList.add('active');
            });
        });
    });
}categoryButtonsActive();

function compareFunctionButton(){
    const menuButton = document.querySelector('.vehica-button--menu-submit');
    const dropdown = document.querySelector('.button-compare-dropdown');
    
    if (menuButton && dropdown) {
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el evento se propague
            dropdown.classList.toggle('show'); // Alternar la clase 'show'
        });
        
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !menuButton.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

function swiperCars() {
    const swiperEl = document.querySelector('[data-swiper=js-swiper-carsFeatured]');
    
    if(swiperEl){
        
        if (swiperEl.swiper) {
            swiperEl.swiper.destroy(true, true);
        }
        
        const slides = swiperEl.querySelectorAll('.swiper-wrapper .swiper-slide');
        
        if (slides.length <= 3) {
            const swiperCarsFeatured = new Swiper(swiperEl, {
                slidesPerView: "auto",
                spaceBetween: 30,
                enabled: false,
                allowTouchMove: false, 
                navigation: false 
            });
            
            document.querySelector('[data-navigation="js-swiper-carsFeatured-prev"]').style.display = 'none';
            document.querySelector('[data-navigation="js-swiper-carsFeatured-next"]').style.display = 'none';
        } else {
            const swiperCarsFeatured = new Swiper(swiperEl, {
                slidesPerView: "auto",
                autoplay: false,
                spaceBetween: 30,
                navigation: {
                    nextEl: '[data-navigation="js-swiper-carsFeatured-next"]',
                    prevEl: '[data-navigation="js-swiper-carsFeatured-prev"]',
                },
                breakpoints: {
                576: {
                    slidesPerView: "auto",
                    slidesPerGroup: 3, 
                    spaceBetween: 18
                },
                768: {
                    slidesPerView: "auto",
                    slidesPerGroup: 3, 
                    spaceBetween: 18
                },
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
        }
    }
    
}
document.addEventListener('DOMContentLoaded', () =>  {
    compareFunctionButton();
    swiperCars();
});

function toggleModal(modalId) {
    console.log('Abriendo modal');
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error(`No se encontró el modal con ID: ${modalId}`);
        return;
    }
    
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    
    modal.toggle();
}

function filterStatus(status, brands) {
    Preloader();

    const $btn = $("#allLastVehicles");

    $.ajax({
        type: "GET",
        url: "/elementAjax/Skins/ResultLastVehicules",
        data: {
            status: status,
            brands: brands
        }
    }).always(function(data) {
        Preloader();

        $("#lastVehicles").html(data); 

        setTimeout(function () {
            var total = $("#totalVehicles").val();

            if (status == 1) {
                $btn.text("Ver nuevos (" + total + ")");
                $btn.attr("href", "/buscador/?status=1");
            }

            if (status == 2) {
                $btn.text("Ver usados (" + total + ")");
                $btn.attr("href", "/buscador/?status=2");
            }
        }, 100);
    });
}

function filterBrands(brands) {
    Preloader();

    const $btn = $("#allBrand");

    $.ajax({
        type: "GET",
        url: "/elementAjax/Skins/ResultPopularBrands",
        data: {
            brands: brands
        }
    }).always(function(data) {
        categoryButtonsActive();
        Preloader();
        $("#brandsFeatured").html(data);
        swiperCars();

        setTimeout(function () {
            let label = "Ver todos los vehículos";
            let total = "";

            if (brands == 1) {
                total = $("#totalBMW").val();
                label = "Ver todos los BMW";
            } else if (brands == 2) {
                total = $("#totalMercedesBenz").val();
                label = "Ver todos los Mercedes-Benz";
            } else if (brands == 3) {
                total = $("#totalAudi").val();
                label = "Ver todos los Audi";
            } else if (brands == 5) {
                total = $("#totalRenault").val();
                label = "Ver todos los Renault";
            }

            if (total) {
                $btn.text(label + " (" + total + ")");
            } else {
                $btn.text(label);
            }

            $btn.attr("href", "/buscador/?brands=" + brands);
        }, 100);
    });
}

function filterModel() {
    Preloader();
    
    var brands = getResponsiveVal(["#vehicleBrand", "#vehicleBrandMobile"]);
    var model = getResponsiveVal(["#vehicleModel", "#vehicleModelMobile"]);
    

    $.ajax({
        type: "GET",
        url: "/elementAjax/Search/SelectModel",
        data: {
            brands: brands,
            model: model
        }
    }).always(function(data) {
        searchVehicles();
        Preloader();
        
        $("#vehicleModel").html(data);
        $("#vehicleModelMobile").html(data);
        viewVehicles();
        
    });
}

function vehicleComparator(id) {
    var cookieName = 'vehicle';
    var cookies = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='));
    var currentValue = cookies ? cookies.split('=')[1] : '';
    var ids = currentValue ? currentValue.split(',') : [];

    if (ids.includes(String(id))) {
        toggleModal('modal-error-comparador');
        return;
    }

    if (ids.length >= 3) {
        toggleModal('modal-maximo-comparador');
        return;
    }

    ids.push(id);
    document.cookie = cookieName + '=' + ids.join(',') + '; path=/; max-age=' + (7 * 24 * 60 * 60);

    $('button[data_vehiculoId="' + id + '"]').addClass('disabled');

    Preloader();

    $.ajax({
        url: "/elementAjax/Vehicles/Comparator",
        data: {
            idVehicle: 'listcomplete'
        }
    }).done(function (data) {
        $("#comparatorDesk, #comparatorMobile").addClass("vehica-button--full");
        $("#comparator").html(data);
    }).always(function () {
        Preloader();
    });

    toggleModal('modal-confirm-comparador');
}


function actualizarBotonesComparador() {
    var cookieName = 'vehicle';
    var cookies = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='));
    var currentValue = cookies ? cookies.split('=')[1] : '';
    var ids = currentValue ? currentValue.split(',') : [];

    // Quita la clase a todos los botones
    $('button[data_vehiculoId]').removeClass('disabled');

    // Agrega la clase solo a los que siguen en la cookie
    ids.forEach(function (id) {
        $('button[data_vehiculoId="' + id + '"]').addClass('disabled');
    });
}


function removeVehicle(id) {
    var cookieName = 'vehicle';
    var vehicleId = id.toString();

    var cookies = document.cookie.split('; ').find(row => row.startsWith(cookieName + '='));
    if (!cookies) return;

    var currentValue = cookies.split('=')[1];
    var ids = currentValue.split(',');

    var updatedIds = ids.filter(i => i !== vehicleId);

    if (updatedIds.length > 0) {
        document.cookie = cookieName + '=' + updatedIds.join(',') + '; path=/; max-age=' + (7 * 24 * 60 * 60);
    } else {
        document.cookie = cookieName + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    }

    var vehicleElement = document.getElementById('vehicule' + vehicleId);
    if (vehicleElement) {
        vehicleElement.remove();
    }

    Preloader();

    $.ajax({
        url: "/elementAjax/Vehicles/Comparator",
        data: {
            idVehicle: 'listcomplete'
        }
    }).always(function (data) {
        if (updatedIds.length === 0) {
            $("#comparatorDesk, #comparatorMobile").removeClass("vehica-button--full");
        }

        Preloader();
        $("#comparator").html(data);

        actualizarBotonesComparador();
    });

    toggleModal('modal-remove-comparador');
}

function getResponsiveVal(selectors) {
    for (var i = 0; i < selectors.length; i++) {
        var val = $(selectors[i]).val();
        if (val && val.trim() !== "") {
            return val;
        }
    }
    return "";
}

function loadMoreCars(page, category_id = null) {
    const nextPageToLoad = parseInt(page);
    if (isNaN(nextPageToLoad)) {
        console.error("loadMoreCars: El número de página no es válido.");
        return;
    }

    Preloader();

    $.ajax({
        type: "GET",
        url: "/elementAjax/Blog/ListBlogCar",
        data: {
            page: nextPageToLoad,
            category_id
        },
        success: function(data) {
            Preloader();
            console.log("HTML completo recibido del servidor:", data);

            const $responseHtml = $(data);

            const $lastExistingArticle = $("#articlesListCar").children().last();
            let scrollTarget = 0; // Por defecto, si no hay artículos previos, desplaza al inicio del contenedor

            if ($lastExistingArticle.length) {
                scrollTarget = $lastExistingArticle.offset().top + $lastExistingArticle.outerHeight(true);
            } else {
                scrollTarget = $("#articlesListCars").offset().top;
            }

            const $newArticlesList = $responseHtml.filter("#articlesListCars").add($responseHtml.find("#articlesListCars"));
            
            if ($newArticlesList.length) {
                $("#articlesListCars").append($newArticlesList.html());

                setTimeout(() => {
                    $('html, body').animate({
                        scrollTop: scrollTarget
                    }, 800);
                }, 50);

            } else {
                console.warn("No se encontraron nuevos artículos para añadir en #articlesListCars.");
            }

            const $newPaginationContainer = $responseHtml.filter("#carsPaginationContainer").add($responseHtml.find("#carsPaginationContainer"));

            if ($newPaginationContainer.length) {
                $("#carsPaginationContainer").replaceWith($newPaginationContainer);
            } else {
                $("#carsPaginationContainer").empty();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            Preloader();
            console.error("Error al cargar más artículos de coches:", textStatus, errorThrown);
        }
    });
}

function searchBlog(page, categoryId = null) {
    // Limpiar parámetros undefined/null
    const effectiveCategoryId = categoryId !== undefined ? categoryId : null;
    Preloader();
    $.ajax({
        url: "/elementAjax/Blog/ListBlog",
        data: {
            page: page,
            category_id: effectiveCategoryId
        },
        success: function(data) {
            Preloader();
            updateContent(data, effectiveCategoryId);
        }
    });
}

function updateContent(data, currentCategory) {
    const $data = $(data);
    const $articlesContainer = $('.blog-articles-list');
    const $paginationContainer = $('.pagination-custom').parent(); // Obtenemos el contenedor padre de la paginación
    const scrollPosition = $articlesContainer.offset().top - 20;

    // 1. Actualiza el contenido de los artículos
    $articlesContainer.html($data.find('.blog-articles-list').html());

    // 2. Verifica si el contenedor de artículos está vacío después de la actualización
    if ($articlesContainer.children().length === 0) {
        $paginationContainer.hide(); // Oculta la paginación si no hay artículos
    } else {
        $paginationContainer.show(); // Asegúrate de mostrarla si sí hay artículos (para casos donde antes no había)

        // 3. Solo actualiza la paginación si hay artículos
        const paginationHtml = $data.find('.pagination-custom').parent()
            .find('a[onclick^="searchBlog"]').each(function() {
                const originalOnClick = $(this).attr('onclick');
                $(this).attr('onclick',
                    originalOnClick.replace(/searchBlog\((\d+)\)/,
                    `searchBlog($1, ${currentCategory || 'null'})`));
            }).end().html();

        $paginationContainer.html(paginationHtml); // Actualiza la paginación
    }

    // 4. Actualiza el filtro activo
    updateActiveFilter(currentCategory);

    // 5. Desplaza la vista
    $('html, body').animate({
        scrollTop: scrollPosition
    }, 500); // 500ms de duración de la animación
}

function updateActiveFilter(activeCategoryId) {
    // Remover active de todos los botones
    $('.blog-main-filter__item').removeClass('active');
    
    // Buscar el botón correcto
    if (activeCategoryId) {
        // Versión segura que no depende del onclick
        $('.blog-main-filter__item').each(function() {
            const match = $(this).attr('onclick')?.match(/searchBlog\(1,\s*(\d+)\)/);
            if (match && parseInt(match[1]) === activeCategoryId) {
                $(this).addClass('active');
                return false; // Salir del each una vez encontrado
            }
        });
    } else {
        // Activar "Ver todos"
        $('.blog-main-filter__item').filter(':contains("Ver todos")').addClass('active');
    }
}

function searchVehicles(page) {
    Preloader();

    var brands = getResponsiveVal(["#vehicleBrand", "#vehicleBrandMobile"]);
    var model = getResponsiveVal(["#vehicleModel", "#vehicleModelMobile"]);
    var year = getResponsiveVal(["#vehicleYear", "#vehicleYearMobile"]);
    var status = getResponsiveVal(["#vehicleStatus", "#vehicleStatusMobile"]);
    var color = getResponsiveVal(["#vehicleColor", "#vehicleColorMobile"]);
    var passengers = getResponsiveVal(["#vehiclePassenserNumber", "#vehiclePassenserNumberMobile"]);
    var engine = getResponsiveVal(["#vehicleEngine", "#vehicleEngineMobile"]);
    var transmission = getResponsiveVal(["#vehicleTransmission", "#vehicleTransmissionMobile"]);
    var line = getResponsiveVal(["#vehicleLine", "#vehicleLineMobile"]);
    var type = getResponsiveVal(["#vehicleType", "#vehicleTypeMobile"]);
    var doorNumber = getResponsiveVal(["#vehicleDoorNumber", "#vehicleDoorNumberMobile"]);
    var fuelType = getResponsiveVal(["#vehicleFuelType", "#vehicleFuelTypeMobile"]);
    var traction = getResponsiveVal(["#vehicleTraction", "#vehicleTractionMobile"]);
    var power = getResponsiveVal(["#vehiclePower", "#vehiclePowerMobile"]);
    var rim = getResponsiveVal(["#vehicleRim", "#vehicleRimMobile"]);
    var vehicleBrandSort = getResponsiveVal(["#vehicleBrandSort", "#vehicleBrandSortMobile"]);
    var valmin = getResponsiveVal(["input[name='valmin']", "input[name='valminMobile']"]);
    var valmax = getResponsiveVal(["input[name='valmax']", "input[name='valmaxMobile']"]);
    var orderSelect = getResponsiveVal(["#orderSelect", "#orderSelectMobile"]);

    $.ajax({
        type: "GET",
        url: "/elementAjax/Search/ListVehicles",
        data: {
            page: page,
            brands: brands,
            model: model,
            year: year,
            status: status,
            color: color,
            passengers: passengers,
            engine: engine,
            transmission: transmission,
            line: line,
            type: type,
            doorNumber: doorNumber,
            fuelType: fuelType,
            traction: traction,
            power: power,
            rim: rim,
            vehicleBrandSort: vehicleBrandSort,
            orderSelect: orderSelect,
            valmin: valmin,
            valmax: valmax
        }
    }).always(function(data) {
        Preloader();
        $("#listVehicules").html(data);
        viewVehicles();
        var total = document.querySelector('[data-total]')?.getAttribute('data-total');
        
        if (total !== null) {
            var strong = document.querySelector('#totalResult strong');
            if (strong) {
                strong.textContent = total;
            }
        }
        
        var totalMobile = $('#totalResult strong').text().trim();

        if (totalMobile) {
            $('#totalResultMobile strong').text(totalMobile);
        }
        
    });
}

function generateToken(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var token = '';
    for (var i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function finalProcessComparator(url) {
    //var idUser = $("#UserId").val();
    var token = generateToken(8);

    if (url) {
        $.ajax({
            type: "POST",
            url: "/elementAjax/Vehicles/ProcessComparator",
            data: {
                //idUser: idUser,
                token: token,
                XPR_PostbackAction: "Vehicles/ProcessComparator",
                action: "finalProcessComparator"
            }
        }).done(function (data) {
            Preloader();
            handleFixedHeader();
            document.cookie = "vehicle=; path=/; max-age=0";

            window.location.href = url + token;
        });
    } else {
        alert('Unknown error', "Error");
    }
}

function handleLogin() {
    const formLogin = document.getElementById('authLogin');
    const errorContainer = formLogin.querySelector('.form-error-login');
    
    errorContainer.classList.add('d-none');
    errorContainer.textContent = '';
    
    if (!formLogin.checkValidity()) {
        formLogin.classList.add('was-validated');
        return;
    }
    
    formLogin.classList.add('was-validated');
    
    const formData = new FormData(formLogin);
    const data = Object.fromEntries(formData.entries());
    
    let dataLogin = {
        "Username": data.emailLogin,
        "Password": data.passwordLogin
    }
    
    fetch('/elementAjax/MyBussinessLogin/Functions?XPR_PostbackAction=MyBussinessLogin/Functions&action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataLogin)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        if (!result.success) {
            errorContainer.textContent = 'Usuario o contraseña incorrectos';
            errorContainer.classList.remove('d-none');
            return;
        }

        const userData = result.data;

        const cookieValue = encodeURIComponent(JSON.stringify(userData));

        // AJUSTE: La cookie ahora expira en 7 días
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        // Creación de la cookie con el nombre y la expiración correctos
        document.cookie = `viraalUser=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;

        window.location.href = '/my-business/auth/inicio-sesion/';
    })
    .catch(error => {
        console.error('Error:', error);
        errorContainer.textContent = error.message || 'Hubo un problema al iniciar sesión.';
        errorContainer.classList.remove('d-none');
    });
}

function createNewAuction() {
    const form = document.getElementById('formAuction');
    const errorContainer = form.querySelector('.form-error');
    const submitButton = form.querySelector('button[type="button"]');

    // Oculta errores previos y valida el formulario
    errorContainer.classList.add('d-none');
    errorContainer.textContent = '';
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
        return;
    }

    // --- PASO 1: Transformar datos del formulario al formato del payload ---
    const formData = new FormData(form);
    const formProps = Object.fromEntries(formData.entries());

    const payload = {
        "FullName": formProps.fullName,
        "Email": formProps.email,
        "Phone": formProps.phone,
        // Convierte el valor del checkbox ('on') a un booleano (true/false)
        "AcceptedTerms": formProps.hasOwnProperty('acceptedTerms'),
        // Renombra y convierte a número el ID del vehículo
        "VehicleRelationId": parseInt(formProps.vehicleId, 10)
    };
    
    // --- PASO 2: Deshabilitar botón y mostrar carga (UX) ---
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Enviando...
    `;

    // --- PASO 3: Enviar datos al endpoint correcto ---
    fetch('/elementAjax/Vehicles/CreateNewLeadAuction?XPR_PostbackAction=Vehicles/CreateNewLeadAuction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        if (!result.success) {
            errorContainer.textContent = result.data || 'Hubo un problema al procesar tu solicitud.';
            errorContainer.classList.remove('d-none');
            return;
        }

        // --- PASO 4: Cierra el modal actual y muestra el de éxito ---
        // Corregimos el ID para que coincida con tu modal de registro
        const currentModalElement = document.getElementById('modal-registro-subasta'); 
        const currentModalInstance = bootstrap.Modal.getInstance(currentModalElement);
        if (currentModalInstance) {
            currentModalInstance.hide();
        }
        
        // Asumimos que tienes un modal de éxito con el ID 'modal-success-create-request'
        const successModal = new bootstrap.Modal(document.getElementById('modal-general'));
        successModal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        errorContainer.textContent = error.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
        errorContainer.classList.remove('d-none');
    })
    .finally(() => {
        // --- PASO 5: Reactivar el botón al finalizar ---
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enviar';
    });
}

// function createUserAndRequest() {
//     const form = document.getElementById('registerRequest');
//     // Busca el contenedor de error DENTRO del formulario actual
//     const errorContainer = form.querySelector('.form-error');

//     // Oculta errores previos
//     errorContainer.classList.add('d-none');
//     errorContainer.textContent = '';

//     // 1. Valida el formulario
//     if (!form.checkValidity()) {
//         form.classList.add('was-validated');
//         return;
//     }

//     form.classList.add('was-validated');
    
//     // 2. Recopila y muestra los datos
//     const formData = new FormData(form);
//     const data = Object.fromEntries(formData.entries());
//     console.log('Datos:', data);
    
//     fetch('/elementAjax/Vehicles/CreateUserAndRequest?XPR_PostbackAction=Vehicles/CreateUserAndRequest', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//     })
//     .then(response => {
//         if (!response.ok) {
//             // Aquí puedes procesar el error que viene de la API
//             return response.json().then(err => { throw err; });
//         }
//         return response.json();
//     })
//     .then(result => {
//         if(!result.success) {
//             errorContainer.textContent = result.data || 'Hubo un problema al procesar tu solicitud.';
//             errorContainer.classList.remove('d-none');
//             return;
//         }

//         form.reset(); 
        
//         form.classList.remove('was-validated'); 

//         // Selecciona tu modal de registro por su ID
//         const currentModalElement = document.getElementById('modal-create-request');
//         // Obtiene la instancia de Bootstrap para ese modal
//         const currentModalInstance = bootstrap.Modal.getInstance(currentModalElement);
//         // Cierra el modal
//         currentModalInstance.hide();
        
//         toggleModal('modal-success-create-request');    
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         // Muestra el mensaje de error de la API en el contenedor
//         errorContainer.textContent = error.message || 'Hubo un problema al procesar tu solicitud.';
//         errorContainer.classList.remove('d-none');
//     });
// }

function createUserAndRequest() {
    const form = document.getElementById('registerRequest');
    const errorContainer = form.querySelector('.form-error');

    errorContainer.classList.add('d-none');
    errorContainer.textContent = '';

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    form.classList.add('was-validated');
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (data.tradeInVehicleDetails) 
            data.tradeInVehicleDetails = JSON.parse(data.tradeInVehicleDetails);
    
    // --- PASO 1: CREAR EL USUARIO ---
    fetch('/elementAjax/Vehicles/CreateUserAndRequest?XPR_PostbackAction=Vehicles/CreateUserAndRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw err; });
        return response.json();
    })
    .then(result => {
        if(!result.success) {
            errorContainer.textContent = result.data || 'Hubo un problema al procesar tu solicitud.';
            errorContainer.classList.remove('d-none');
            return;
        }

        // Registro Exitoso: Limpiamos formulario
        form.reset(); 
        form.classList.remove('was-validated'); 

        // Cerramos el modal de registro
        const currentModalElement = document.getElementById('modal-create-request');
        const currentModalInstance = bootstrap.Modal.getInstance(currentModalElement);
        if(currentModalInstance) currentModalInstance.hide();
        
        // --- PREPARACIÓN PARA EL LOGIN (NUEVO) ---
        // Buscamos el botón del siguiente modal
        const btnFinalize = document.getElementById('btn-finalize-login');
        if(btnFinalize) {
            // Guardamos temporalmente las credenciales en atributos del botón
            // Asegúrate que los names en tu HTML sean 'email' y 'password'
            btnFinalize.dataset.username = data.email; 
            btnFinalize.dataset.password = data.password;
            
            // Reseteamos el texto por si se quedó cargando de un intento previo
            btnFinalize.textContent = 'Ver solicitud';
            btnFinalize.classList.remove('disabled');
        }

        // Abrimos el modal de éxito
        toggleModal('modal-success-create-request');      
    })
    .catch(error => {
        console.error('Error:', error);
        errorContainer.textContent = error.message || 'Hubo un problema al procesar tu solicitud.';
        errorContainer.classList.remove('d-none');
    });
}

function toggleModalContent(modalId, titulo, texto) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error(`Error: No se encontró el modal con ID: ${modalId}`);
        return;
    }

    const modalTitleElement = modalElement.querySelector('.modal-title');
    const modalBodyElement = modalElement.querySelector('.modal-body');

    if (modalTitleElement) {
        modalTitleElement.textContent = titulo;
    } else {
        console.warn(`Advertencia: No se encontró un elemento con la clase '.modal-title' en el modal '${modalId}'.`);
    }

    if (modalBodyElement) {
        modalBodyElement.innerHTML = texto; 
    } else {
        console.warn(`Advertencia: No se encontró un elemento con la clase '.modal-body' en el modal '${modalId}'.`);
    }

    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    
    modal.show(); 
}


/**
 * Muestra u oculta un modal de Bootstrap con título y mensaje personalizados.
 * @param {string} modalId - El ID del elemento modal en el DOM.
 * @param {string} [title='Atención'] - El título a mostrar en el modal.
 * @param {string} [message='Ha ocurrido un error.'] - El mensaje de error o informativo a mostrar.
 */
function toggleModalError(modalId, title = 'Atención', message = 'Ha ocurrido un error.') {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.error(`No se encontró el modal con ID: ${modalId}`);
        return;
    }

    // Encuentra los elementos del título y la descripción dentro del modal
    const titleElement = modalElement.querySelector('#labelTitleError');
    const descriptionElement = modalElement.querySelector('#descriptionError p');

    // Actualiza el contenido de los elementos si existen
    if (titleElement) {
        titleElement.textContent = title;
    }
    if (descriptionElement) {
        descriptionElement.textContent = message;
    }

    // Muestra el modal
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show(); // Usamos show() en lugar de toggle() para asegurar que siempre se abra
}

function Preloader() {
    const preloader = document.getElementById('preloader');
    preloader.classList.toggle('active');
}

function agregarFavorito(IdFavorito, IdUser) {
    // 1. Seleccionamos AMBOS tipos de botones (Cards y Detalle) usando selectores de atributo
    var $btnsDetalle = $('[id="favorito-detalle-' + IdFavorito + '"]');
    var $btnsCard = $('[id="favorito-' + IdFavorito + '"]');
    
    // Agrupamos todos para bloquearlos durante la carga
    var $todosBtns = $btnsDetalle.add($btnsCard);

    Preloader();
    $todosBtns.attr('onclick', ''); // Bloquear click

    $.ajax({
        type: "POST",
        url: "/elementAjax/Favourites/AddDeleteFavourites",
        data: {
            XPR_PostbackAction: "Favourites/AddDeleteFavourites",
            Estatus: "Agregar",
            IdFavorito: IdFavorito,
            IdUser: IdUser,
        }
    }).done(function (data) {
        var variables = (typeof data === 'string') ? JSON.parse(data) : data;

        // --- A. ACTUALIZAR VISTA DETALLE (Texto + FontAwesome) ---
        // HTML: <i class="fas fa-star"></i> Quitar de favoritos
        $btnsDetalle.html('<i class="fas fa-star"></i> Quitar de favoritos');
        $btnsDetalle.addClass('active');

        // --- B. ACTUALIZAR VISTA CARD (Solo Span Icono) ---
        // Buscamos el span dentro del botón y cambiamos la clase específica
        $btnsCard.find('span.icon').removeClass('icon-star-emp').addClass('icon-star-full');
        $btnsCard.addClass('active');

        // --- C. COMÚN (Actualizar OnClick en ambos) ---
        $todosBtns.attr('onclick', 'removerFavorito(' + IdFavorito + ',' + variables.Id + ');');

        toggleModal('modal-favoritoAdd');
        Preloader();
    }).fail(function() {
        Preloader();
        // Restaurar onclick original en caso de error
        $todosBtns.attr('onclick', 'agregarFavorito(' + IdFavorito + ',' + IdUser + ');');
    });
}

function removerFavorito(IdFavorito, Id) {
    var $btnsDetalle = $('[id="favorito-detalle-' + IdFavorito + '"]');
    var $btnsCard = $('[id="favorito-' + IdFavorito + '"]');
    var $todosBtns = $btnsDetalle.add($btnsCard);

    Preloader();
    $todosBtns.attr('onclick', '');

    $.ajax({
        type: "POST",
        url: "/elementAjax/Favourites/AddDeleteFavourites",
        data: {
            XPR_PostbackAction: "Favourites/AddDeleteFavourites",
            Estatus: "Eliminar",
            Id: Id
        }
    }).done(function (data) {
        var variables = (typeof data === 'string') ? JSON.parse(data) : data;
        var userId = variables.IdUser || variables.idUser; 

        // --- A. ACTUALIZAR VISTA DETALLE (Texto + FontAwesome) ---
        // HTML: <i class="far fa-star"></i> Agregar a favoritos
        $btnsDetalle.html('<i class="far fa-star"></i> Agregar a favoritos');
        $btnsDetalle.removeClass('active');

        // --- B. ACTUALIZAR VISTA CARD (Solo Span Icono) ---
        // Buscamos el span y volvemos a poner la clase "emp" (empty)
        $btnsCard.find('span.icon').removeClass('icon-star-full').addClass('icon-star-emp');
        $btnsCard.removeClass('active');

        // --- C. COMÚN (Actualizar OnClick en ambos) ---
        $todosBtns.attr('onclick', 'agregarFavorito(' + IdFavorito + ',' + userId + ');');

        toggleModal('modal-favoritoRemove');
        Preloader();
    }).fail(function() {
        Preloader();
        $todosBtns.attr('onclick', 'removerFavorito(' + IdFavorito + ',' + Id + ');');
    });
}


$(document).ready(function () {
    var total = $('[data-total]').attr('data-total');

    if (typeof total !== "undefined") {
        var $strong = $('#totalResult strong');
        if ($strong.length) {
            $strong.text(total);
        }
    }
    
    var totalMobile = $('#totalResult strong').text().trim();

    if (totalMobile) {
        $('#totalResultMobile strong').text(totalMobile);
    }
});

// Escucha el evento de Bootstrap que se dispara cuando un modal se ha mostrado
document.getElementById('modal-create-request').addEventListener('shown.bs.modal', () => {
    const savedDataString = sessionStorage.getItem('simulationData');
    
    if (savedDataString) {
        const savedData = JSON.parse(savedDataString);
        console.log('Datos recuperados para el formulario:', savedData);

        const agreementInput = document.getElementById('registerAgreementType');
        if (agreementInput && savedData.tipoConvenio) {
            agreementInput.value = savedData.tipoConvenio.id;
        }

        if (document.getElementById('hiddenCreditAmount')) 
            document.getElementById('hiddenCreditAmount').value = savedData.valorCredito || 0;

        if (document.getElementById('hiddenVehiclePrice')) 
            document.getElementById('hiddenVehiclePrice').value = savedData.precioVehiculo || 0;
            
        if (document.getElementById('hiddenDownPayment')) 
            document.getElementById('hiddenDownPayment').value = savedData.enganche || 0;

        if (document.getElementById('hiddenTradeInValue')) 
            document.getElementById('hiddenTradeInValue').value = savedData.valorVehiculoPartePago || 0;

        if (document.getElementById('hiddenApprovedAmount')) 
            document.getElementById('hiddenApprovedAmount').value = savedData.creditoDisponible || 0;
            
        if (savedData.detalleVehiculoPartePago) {
            const detailsInput = document.getElementById('hiddenTradeInVehicleDetails');
            if (detailsInput) {
                detailsInput.value = JSON.stringify(savedData.detalleVehiculoPartePago);
            }
        } else {
            const detailsInput = document.getElementById('hiddenTradeInVehicleDetails');
            if (detailsInput) detailsInput.value = '';
        }

        if (savedData.mensualidades) {
            if (document.getElementById('hiddenInstallments')) 
                document.getElementById('hiddenInstallments').value = savedData.mensualidades.plazo || '';
            
            if (document.getElementById('hiddenMonthlyFee')) 
                document.getElementById('hiddenMonthlyFee').value = savedData.mensualidades.monto || '';
            
            if (document.getElementById('hiddenPaymentPeriod')) 
                document.getElementById('hiddenPaymentPeriod').value = savedData.mensualidades.periodo || '';
            
            if (document.getElementById('hiddenYearlyRate')) 
                document.getElementById('hiddenYearlyRate').value = savedData.mensualidades.tasaAnual || '';
            
            if (document.getElementById('hiddenTotalInterest'))
                document.getElementById('hiddenTotalInterest').value = savedData.mensualidades.interesesTotales || 0;
        }
    }
});




/* Script para gestionar el campo password dentro del modal */
document.addEventListener('DOMContentLoaded', function() {
    
    // Detectar cuando el modal se abre completamente
    var myModal = document.getElementById('modal-create-request');
    
    if(myModal){
        myModal.addEventListener('shown.bs.modal', function () {
            // Buscamos el input de password del registro
            var passInput = document.querySelector('#registerRequest input[name="password"]');
            
            if(passInput) {
                // Lo forzamos a readonly cada vez que se abre el modal
                // para evitar que Chrome lo rellene con basura antigua
                passInput.setAttribute('readonly', 'readonly');
            }
        });
    }
    
    const btnFinalize = document.getElementById('btn-finalize-login');

    if (btnFinalize) {
        btnFinalize.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Recuperar credenciales guardadas en el paso anterior
            const username = this.dataset.username;
            const password = this.dataset.password;

            if (!username || !password) {
                console.error('No hay credenciales para el login automático');
                // Fallback: Redirigir al login manual si algo falla
                window.location.href = '/my-business/auth/inicio-sesion/';
                return;
            }

            // UX: Indicar que está cargando
            const originalText = this.textContent;
            this.textContent = 'Iniciando sesión...';
            this.classList.add('disabled'); // Evitar doble click

            // 2. Preparar payload
            let dataLogin = {
                "Username": username,
                "Password": password
            };

            // 3. Ejecutar Login (Lógica idéntica a handleLogin)
            fetch('/elementAjax/MyBussinessLogin/Functions?XPR_PostbackAction=MyBussinessLogin/Functions&action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataLogin)
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw err; });
                return response.json();
            })
            .then(result => {
                if (!result.success) {
                    // Si falla el login (raro si acaba de registrarse), mostramos alert o redirigimos
                    alert('Error al iniciar sesión automáticamente. Por favor ingresa manualmente.');
                    window.location.href = '/my-business/auth/inicio-sesion/';
                    return;
                }

                // 4. Crear Cookie
                const userData = result.data;
                const cookieValue = encodeURIComponent(JSON.stringify(userData));

                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);

                document.cookie = `viraalUser=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;

                // 5. Redireccionar
                window.location.href = '/my-business/auth/inicio-sesion/';
            })
            .catch(error => {
                console.error('Error en login automático:', error);
                // Restaurar botón en caso de error de red
                this.textContent = originalText;
                this.classList.remove('disabled');
                alert('Ocurrió un error de conexión. Intenta nuevamente.');
            });
        });
    }
});









