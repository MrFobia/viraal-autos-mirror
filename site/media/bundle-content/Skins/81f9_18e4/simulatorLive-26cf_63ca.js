document.addEventListener('DOMContentLoaded', () => {

    const Helpers = {
        fileToBase64: (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        }),
        parseCurrency: (stringValue) => {
            if (!stringValue) return 0;
            return parseInt(String(stringValue).replace(/[^0-9.]/g, ""), 10) || 0;
        },
        formatCurrency: (value) => {
            return new Intl.NumberFormat('es-MX', {
                style: 'decimal',
                minimumFractionDigits: 0
            }).format(value);
        }
    };

    // --- MÓDULO LIBRO AZUL (VEHÍCULO A CAMBIO) ---
    const LibroAzul = {
        API_URL: '/elementAjax/LibroAzul/Resource?XPR_PostbackAction=LibroAzul/Resource',
        elements: {
            container: document.getElementById('usedVehicleFormContainer'),
            checkbox: document.getElementById('toggleUsedVehicleForm'),
            ano: document.getElementById('anoSelect'),
            marca: document.getElementById('marcaSelect'),
            modelo: document.getElementById('modeloSelect'),
            version: document.getElementById('versionSelect'),
            valor: document.getElementById('valorVehiculoInput'),
            libroAzulResume: document.getElementById('libroAzulPriceVehicle'),
            containerResumeTop: document.getElementById('simulateContainerResumeTop'),

            tradeInRow: document.getElementById('tradeInValuationRow'),
            tradeInRowInitial: document.getElementById('tradeInValuationRowInitial'),

            // AGREGADOS: Referencias a los disclaimers para controlarlos aquí
            disclaimerInitial: document.getElementById('disclaimer-initial'),
            disclaimerValues: document.getElementById('disclaimer-values'),
        },

        setLoadingState(select, isLoading) {
            const firstOption = select.firstElementChild;
            select.disabled = isLoading;
            const map = {
                anoSelect: 'Seleccionar año...',
                marcaSelect: 'Seleccionar marca...',
                modeloSelect: 'Seleccionar modelo...',
                versionSelect: 'Seleccionar versión...'
            };
            firstOption.textContent = isLoading ? 'Cargando...' : map[select.id];
        },

        async callApi(action, body = {}) {
            const url = `${this.API_URL}&action=${action}`;
            try {
                if (action !== 'getPrice' && Math.random() < 0.0001) {
                    throw new Error("Simulated API failure");
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const json = await response.json();
                if (json && json.success) return json.data;
                return action === 'getPrice' ? null : [];
            } catch (error) {
                console.error(`Fetch failed for ${action}:`, error);
                return action === 'getPrice' ? null : [];
            }
        },

        populateSelect(select, items, valueKey, textKey) {
            this.setLoadingState(select, false);
            select.innerHTML = `<option value="">${select.firstElementChild.textContent}</option>`;
            if (Array.isArray(items)) items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item[valueKey];
                opt.textContent = item[textKey];
                select.appendChild(opt);
            });
        },

        init() {
            this.elements.checkbox.addEventListener('change', () => {
                // 1. Mostrar/Ocultar formulario
                this.elements.container.style.display = this.elements.checkbox.checked ? 'block' : 'none';

                // 2. Control de visibilidad del resumen superior
                const isSimulationActive = SimuladorCredito.elements.resultsSection.style.display === 'block';

                if (this.elements.tradeInRow) {
                    this.elements.tradeInRow.style.display = this.elements.checkbox.checked ? 'block' : 'none';
                }
                if (this.elements.tradeInRowInitial) {
                    this.elements.tradeInRowInitial.style.display = this.elements.checkbox.checked ? 'block' : 'none';
                }

                if (!isSimulationActive) {
                    if (this.elements.containerResumeTop) {
                        this.elements.containerResumeTop.style.display = 'block';
                    }
                }

                // Eliminada la funcionalidad que mostraba el disclaimer-values al alternar el switch
                // Se mostrará al dar click en 'Simular crédito' (en la función updateResultsUI)

                // 3. Reset visual
                this.elements.valor.value = '0';
                this.elements.libroAzulResume.textContent = '$0';

                [this.elements.ano, this.elements.marca, this.elements.modelo, this.elements.version].forEach(el => {
                    if (el) el.value = '';
                    if (el && el.firstElementChild) {
                        const map = {
                            anoSelect: 'Seleccionar año...',
                            marcaSelect: 'Seleccionar marca...',
                            modeloSelect: 'Seleccionar modelo...',
                            versionSelect: 'Seleccionar versión...'
                        };
                        el.firstElementChild.textContent = map[el.id] || 'Seleccionar...';
                    }
                });

                // 4. Recalcular
                SimuladorCredito.updateAporteInicial();
            });

            // ... (Resto del código init sin cambios: Carga inicial de años, listeners en cascada, etc.) ...
            (async () => {
                this.setLoadingState(this.elements.ano, true);
                const years = await this.callApi('getYears');
                this.populateSelect(this.elements.ano, years, 'Clave', 'Nombre');
            })();

            this.elements.ano.addEventListener('change', async () => {
                [this.elements.marca, this.elements.modelo, this.elements.version].forEach(el => {
                    el.disabled = true;
                    this.populateSelect(el, [], '', '');
                });
                this.elements.valor.value = '0';
                this.elements.libroAzulResume.textContent = '$0';

                if (!this.elements.ano.value) {
                    SimuladorCredito.updateAporteInicial();
                    return;
                }

                this.setLoadingState(this.elements.marca, true);
                const brands = await this.callApi('getBrands', {
                    "Clase": 0, "Edicion": 0, "ClaveAnio": parseInt(this.elements.ano.value)
                });
                this.populateSelect(this.elements.marca, brands, 'Clave', 'Nombre');
            });

            this.elements.marca.addEventListener('change', async () => {
                [this.elements.modelo, this.elements.version].forEach(el => {
                    el.disabled = true;
                    this.populateSelect(el, [], '', '');
                });
                this.elements.valor.value = '0';
                this.elements.libroAzulResume.textContent = '$0';

                if (!this.elements.marca.value) {
                    SimuladorCredito.updateAporteInicial();
                    return;
                }

                this.setLoadingState(this.elements.modelo, true);
                const models = await this.callApi('getModels', {
                    "Clase": 0, "Edicion": 0, "ClaveAnio": parseInt(this.elements.ano.value), "ClaveMarca": parseInt(this.elements.marca.value)
                });
                this.populateSelect(this.elements.modelo, models, 'Clave', 'Nombre');
            });

            this.elements.modelo.addEventListener('change', async () => {
                this.elements.version.disabled = true;
                this.populateSelect(this.elements.version, [], '', '');
                this.elements.valor.value = '0';
                this.elements.libroAzulResume.textContent = '$0';

                if (!this.elements.modelo.value) {
                    SimuladorCredito.updateAporteInicial();
                    return;
                }

                this.setLoadingState(this.elements.version, true);
                const versions = await this.callApi('getVersions', {
                    "Clase": 0, "ClaveAnio": parseInt(this.elements.ano.value), "ClaveMarca": parseInt(this.elements.marca.value), "ClaveModelo": parseInt(this.elements.modelo.value)
                });
                this.populateSelect(this.elements.version, versions, 'Clave', 'Nombre');
            });

            this.elements.version.addEventListener('change', async () => {
                this.elements.valor.value = 'Calculando...';
                this.elements.libroAzulResume.textContent = 'Calculando...';

                if (!this.elements.version.value) {
                    this.elements.valor.value = '0';
                    this.elements.libroAzulResume.textContent = '$0';
                    SimuladorCredito.updateAporteInicial();
                    return;
                }

                const priceData = await this.callApi('getPrice', {
                    "Clase": 0, "ClaveVersion": parseInt(this.elements.version.value)
                });

                const valor = (priceData && priceData.Venta) ? priceData.Venta : 50000;
                this.elements.valor.value = Helpers.formatCurrency(valor);
                this.elements.libroAzulResume.textContent = "$" + Helpers.formatCurrency(valor);

                SimuladorCredito.updateAporteInicial();
            });
        }
    };


    // --- MÓDULO SIMULADOR DE CRÉDITO ---
    const SimuladorCredito = {
        API_URL: '/elementAjax/SimuladorCredito/Resource?XPR_PostbackAction=SimuladorCredito/Resource&action=getCalculator',
        elements: {
            form: document.getElementById('creditSimulatorForm'),
            simulateBtn: document.getElementById('simulateCreditBtn'),
            solicitarBtn: document.getElementById('solicitarCreditoBtn'),
            solicitarBtnMobile: document.getElementById('solicitarCreditoBtnMobile'),
            mobileSolicitarContainer: document.getElementById('mobileSolicitarContainer'),
            convenio: document.getElementById('tipoConvenioSelect'),
            cfdi: document.getElementById('cfdiInput'),
            aporteManual: document.getElementById('aporteInicialInput'),
            precioVehiculoManual: document.getElementById('precioVehiculoInput'),
            resultsSection: document.getElementById('resultsSection'),
            plansSelection: document.getElementById('plans-selection'),
            disclaimerRejected: document.getElementById('disclaimerRejected'),
            disclaimerAproved: document.getElementById('disclaimerAproved'),
            gapRequestedAmount: document.getElementById('gap-requested-amount'),
            gapDiffAmount: document.getElementById('gap-diff-amount'),
            plazoRange: document.getElementById('plazoRange'),
            plazoLabels: document.getElementById('plazoLabels'),
            plazoSelectedTitle: document.getElementById('plazoSelectedTitle'),
            pagoValue: document.getElementById('pago-value'),
            interesesValue: document.getElementById('intereses-value'),
            tasaAnualValue: document.getElementById('tasa-anual-value'),
            creditoValue: document.getElementById('credito-value'),
            creditFailed: document.getElementById('creditoValueFailed'),
            resultValorSolicitado: document.getElementById('resultValorSolicitado'),
            disclaimerInitial: document.getElementById('disclaimer-initial'),
            disclaimerFinal: document.getElementById('disclaimer-values'),
            containerResumeTop: document.getElementById('simulateContainerResumeTop'),
            nsInput: document.getElementById('nsInput'),
            cfdiInput: document.getElementById('cfdiInput'),
            cfdiWrapper: document.getElementById('cfdiWrapper'),
            nsWrapper: document.getElementById('nsWrapper'),
            priceVehicleLibroAzul: document.getElementById('priceVehicleLibroAzul'),
            resultCreditSolit: document.getElementById('resultCreditSolit'),
            resumeCreditSoli: document.getElementById('resumeCreditSoli'),
            resumeEnganche: document.getElementById('resumeEnganche'),
            resultPriceVehicle: document.getElementById("resultPriceVehicle"),
            resultEnganche: document.getElementById("resultEnganche"),
            resumePrecio: document.getElementById("resumePriceVehicle"),
            resultCreditoDisponible: document.getElementById('resultCreditoDisponible'),
        },

        ofertasData: [],
        seleccionUsuario: {},
        manualAporteValue: 0,
        excedenteLibroAzul: 0,

        async callApi(body = {}) {
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const json = await response.json();
                if (json && json.success && json.data && json.data.status) {
                    return json.data.data;
                }
                return null;
            } catch (error) {
                console.error(`Fetch falló para el simulador:`, error);
                return null;
            }
        },

        checkSimulateButtonState() {
            const convenio = this.elements.convenio.value;
            const precio = this.elements.precioVehiculoManual.value;
            let fileOrNssValid = (convenio === '1000') ? (this.elements.nsInput.value.trim() !== '') : (this.elements.cfdi.files.length > 0);
            const isValid = convenio !== '' && precio !== '' && fileOrNssValid;
            if (isValid) {
                this.elements.simulateBtn.classList.remove('button-disabled');
                this.elements.simulateBtn.removeAttribute('disabled');
            } else {
                this.elements.simulateBtn.classList.add('button-disabled');
                this.elements.simulateBtn.setAttribute('disabled', 'true');
            }
        },

        updateAporteInicial() {
            const precioVehiculo = Helpers.parseCurrency(this.elements.precioVehiculoManual.value);
            const aporteVehiculoTasacion = LibroAzul.elements.checkbox.checked ? Helpers.parseCurrency(LibroAzul.elements.valor.value) : 0;
            const engancheSoloEfectivo = this.manualAporteValue;
            const maxAporteAutoAplicable = Math.max(0, precioVehiculo - engancheSoloEfectivo);
            const aporteVehiculoEfectivo = Math.min(aporteVehiculoTasacion, maxAporteAutoAplicable);
            const totalDeduccion = engancheSoloEfectivo + aporteVehiculoEfectivo;
            const creditoSolicitadoNum = Math.max(0, precioVehiculo - totalDeduccion);

            this.excedenteLibroAzul = Math.max(0, aporteVehiculoTasacion - aporteVehiculoEfectivo);

            // Precio del Vehículo
            if (this.elements.resumePrecio) this.elements.resumePrecio.textContent = `$${Helpers.formatCurrency(precioVehiculo)}`;
            if (this.elements.resultPriceVehicle) this.elements.resultPriceVehicle.textContent = `$${Helpers.formatCurrency(precioVehiculo)}`;

            if (this.elements.resumeEnganche) this.elements.resumeEnganche.textContent = `$${Helpers.formatCurrency(engancheSoloEfectivo)}`;
            if (this.elements.resultEnganche) this.elements.resultEnganche.textContent = `$${Helpers.formatCurrency(engancheSoloEfectivo)}`;

            if (this.elements.resumeCreditSoli) this.elements.resumeCreditSoli.textContent = `$${Helpers.formatCurrency(creditoSolicitadoNum)}`;
            if (this.elements.resultCreditSolit) this.elements.resultCreditSolit.textContent = `$${Helpers.formatCurrency(creditoSolicitadoNum)}`;

            if (this.elements.priceVehicleLibroAzul) this.elements.priceVehicleLibroAzul.textContent = `$${Helpers.formatCurrency(aporteVehiculoEfectivo)}`;
        },

        async handleSimulate(event) {
            event.preventDefault();
            this.elements.form.classList.add('was-validated');
            this.updateAporteInicial();
            const valorSolicitadoNum = Helpers.parseCurrency(this.elements.resultCreditSolit.textContent) || 0;

            if (this.excedenteLibroAzul > 0) {
                const valorTasacionOriginal = Helpers.formatCurrency(this.excedenteLibroAzul + Helpers.parseCurrency(this.elements.priceVehicleLibroAzul.textContent));
                let modalMessage = `El valor de su vehículo usado ($${valorTasacionOriginal}) es mayor al monto requerido para el enganche. Se utilizaron el excedente para cubrir el pago total.`;
                toggleModalError('modal-errors', 'Información Importante', modalMessage);
                if (valorSolicitadoNum === 0) {
                    this.elements.resultsSection.style.display = 'none';
                    return;
                }
            }

            if (typeof Preloader === 'function') Preloader();

            try {
                const isPensionadoLey = (this.elements.convenio.value === '1000');
                const payload = {
                    idConvenio: parseInt(this.elements.convenio.value),
                    enganche: Helpers.parseCurrency(this.elements.resumeEnganche.textContent) || 0,
                    valorCredito: valorSolicitadoNum,
                    precioVehiculo: Helpers.parseCurrency(this.elements.precioVehiculoManual.value) || 0,
                    ...(isPensionadoLey ? { nss: this.elements.nsInput.value.trim() } : { archivo: await Helpers.fileToBase64(this.elements.cfdi.files[0]) })
                };

                const simulationResult = await this.callApi(payload);

                if (simulationResult && simulationResult.ofertas && simulationResult.ofertas.length > 0) {

                    // --- CONSOLE 1: DATA COMO VIENE DE LA API ---
                    console.log("Data Original API:", JSON.parse(JSON.stringify(simulationResult.ofertas)));

                    // --- ORDENAMIENTO DE MENOR A MAYOR PLAZO ---
                    const ofertasOrdenadas = simulationResult.ofertas.sort((a, b) => parseInt(a.plazo) - parseInt(b.plazo));

                    // --- CONSOLE 2: DATA ORDENADA DE MENOR A MAYOR ---
                    console.log("Data Ordenada (Menor a Mayor):", ofertasOrdenadas);

                    this.ofertasData = ofertasOrdenadas;
                    this.updateResultsUI();

                    if (this.elements.containerResumeTop) {
                        this.elements.containerResumeTop.style.display = 'none';
                    }

                    this.elements.resultsSection.style.display = 'block';
                    this.elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.elements.solicitarBtn.disabled = false;
                    if (this.elements.solicitarBtnMobile) this.elements.solicitarBtnMobile.disabled = false;
                    if (this.elements.mobileSolicitarContainer) this.elements.mobileSolicitarContainer.style.display = 'block';

                } else {
                    toggleModalError('modal-errors', 'Error', 'No hay ofertas disponibles.');
                }
            } catch (error) {
                console.error("Error during simulation:", error);
            } finally {
                if (typeof Preloader === 'function') Preloader();
                this.elements.simulateBtn.disabled = false;
                this.elements.simulateBtn.textContent = 'Simular crédito';
                this.checkSimulateButtonState();
            }
        },

        updateResultsUI() {
            if (this.ofertasData.length === 0) return;
            this.elements.resultsSection.style.display = 'block';
            if (this.elements.plansSelection) {
                this.elements.plansSelection.style.display = 'block';
            }
            if (this.elements.disclaimerFinal) {
                this.elements.disclaimerFinal.style.display = 'block';
            }

            const ultimoIndice = this.ofertasData.length - 1;

            // 1. Configurar Slider e iniciar a la derecha
            this.elements.plazoRange.min = 0;
            this.elements.plazoRange.max = ultimoIndice;
            this.elements.plazoRange.step = 1;
            this.elements.plazoRange.value = ultimoIndice;

            this.elements.plazoLabels.innerHTML = '';
            const rangeContainer = this.elements.plazoRange.closest('.range-container');

            // 2. Limpiar y recrear marcadores con su funcionalidad de CLICK
            if (rangeContainer) {
                document.querySelectorAll('.plazo-marker').forEach(marker => marker.remove());

                this.ofertasData.forEach((_, index) => {
                    const marker = document.createElement('div');
                    marker.classList.add('plazo-marker');
                    marker.dataset.index = index;
                    marker.style.left = `${(index / ultimoIndice) * 100}%`;

                    // Reinstalar funcionalidad de CLICK en el punto
                    marker.addEventListener('click', () => {
                        this.elements.plazoRange.value = index;
                        updatePlazoUI(index);
                    });

                    rangeContainer.appendChild(marker);
                });
            }

            const updatePlazoUI = (value) => {
                const currentPlazoIndex = parseInt(value);
                const totalSteps = this.ofertasData.length - 1;
                const fillPercentage = totalSteps > 0 ? (currentPlazoIndex / totalSteps) * 100 : 0;

                // 1. Relleno de la barra
                this.elements.plazoRange.style.setProperty('--track-fill', `${fillPercentage}%`);

                // 2. Gestión de Marcadores y Tooltip Único
                document.querySelectorAll('.plazo-marker').forEach((marker, index) => {
                    // Manejo de clase active (ilumina los puntos por donde pasa la barra)
                    marker.classList.toggle('active', index <= currentPlazoIndex);

                    // ELIMINAR cualquier tooltip existente en todos los marcadores para asegurar que solo haya uno
                    const existingTooltip = marker.querySelector('.range-floating-tooltip');
                    if (existingTooltip) {
                        existingTooltip.remove();
                    }

                    // INYECTAR el tooltip SOLO en el marcador que coincide exactamente con la posición del slider
                    if (index === currentPlazoIndex) {
                        const tooltip = document.createElement('div');
                        tooltip.classList.add('range-floating-tooltip');
                        tooltip.textContent = '¡Desliza y selecciona el plazo!';
                        marker.appendChild(tooltip);
                    }
                });

                const oferta = this.ofertasData[currentPlazoIndex];
                if (!oferta) return;

                const creditoDisponible = oferta.monto_credito;
                const creditoSolicitado = Helpers.parseCurrency(this.elements.resultCreditSolit.textContent);

                // NUEVA LÓGICA: Actualizamos el nuevo campo en la lista de detalles
                if (this.elements.resultCreditoDisponible) {
                    this.elements.resultCreditoDisponible.textContent = `$${Helpers.formatCurrency(creditoDisponible)}`;
                }

                let periodoTexto = (oferta.periodo?.toUpperCase() === 'QUINCENAL') ? 'quincenas' :
                    (oferta.periodo?.toUpperCase() === 'MENSUAL') ? 'meses' : 'semanas';

                if (this.elements.plazoSelectedTitle) {
                    this.elements.plazoSelectedTitle.textContent = ` ${oferta.plazo} ${periodoTexto}`;
                }

                this.elements.pagoValue.textContent = "$" + Helpers.formatCurrency(oferta.descuento);

                this.elements.interesesValue.textContent = "$" + Helpers.formatCurrency(oferta.monto_credito_intereses - oferta.monto_credito);

                this.elements.tasaAnualValue.textContent = oferta.tasa_anual + "%";

                if (creditoDisponible >= creditoSolicitado) {
                    this.elements.creditoValue.textContent = "$" + Helpers.formatCurrency(creditoDisponible);
                    this.elements.creditoValue.style.display = 'block';
                    this.elements.creditFailed.style.display = 'none';

                    if (this.elements.disclaimerAproved) this.elements.disclaimerAproved.style.display = 'block';
                    if (this.elements.disclaimerRejected) this.elements.disclaimerRejected.style.display = 'none';

                    // ELIMINADA LA LÍNEA QUE SOBRESCRIBÍA EL VALOR AQUÍ
                } else {
                    this.elements.creditFailed.textContent = "$" + Helpers.formatCurrency(creditoDisponible);
                    this.elements.creditFailed.style.display = 'block';
                    this.elements.creditoValue.style.display = 'none';

                    if (this.elements.disclaimerAproved) this.elements.disclaimerAproved.style.display = 'none';
                    if (this.elements.disclaimerRejected) this.elements.disclaimerRejected.style.display = 'block';

                    const diferencia = creditoSolicitado - creditoDisponible;
                    if (this.elements.gapRequestedAmount) this.elements.gapRequestedAmount.textContent = this.elements.resultCreditSolit.textContent;
                    if (this.elements.gapDiffAmount) this.elements.gapDiffAmount.textContent = `$${Helpers.formatCurrency(diferencia)}`;

                    // ELIMINADA LA LÍNEA QUE SOBRESCRIBÍA EL VALOR AQUÍ
                }

                // 1. Recalculamos o recuperamos los valores exactos de la UI
                const valorCreditoSolicitado = Helpers.parseCurrency(this.elements.resultCreditSolit.textContent);

                // Verificamos si hay auto a cambio
                const isTradeInActive = LibroAzul.elements.checkbox.checked;
                const valorVehiculoUsado = isTradeInActive ? Helpers.parseCurrency(LibroAzul.elements.valor.value) : 0;

                const rawIntereses = oferta.monto_credito_intereses - oferta.monto_credito;
                const interesesTotalesCalculados = parseFloat(rawIntereses.toFixed(2));

                let detalleAutoUsado = null;

                if (isTradeInActive) {
                    // Función auxiliar para obtener el texto del select de forma segura
                    const getSelectText = (element) => element.options[element.selectedIndex]?.text || '';

                    detalleAutoUsado = {
                        anio: getSelectText(LibroAzul.elements.ano),
                        marca: getSelectText(LibroAzul.elements.marca),
                        modelo: getSelectText(LibroAzul.elements.modelo),
                        version: getSelectText(LibroAzul.elements.version),
                        precioEstimado: valorVehiculoUsado
                    };
                }

                // 2. Construimos el objeto para storage
                this.seleccionUsuario = {

                    tipoConvenio: {
                        id: parseInt(this.elements.convenio.value),
                        texto: this.elements.convenio.options[this.elements.convenio.selectedIndex].text
                    },
                    precioVehiculo: Helpers.parseCurrency(this.elements.precioVehiculoManual.value),

                    // Enganche: Solo el dinero en efectivo que puso el usuario
                    enganche: this.manualAporteValue,

                    // Auto a cambio: El valor del libro azul (si aplica)
                    valorVehiculoPartePago: valorVehiculoUsado,

                    // Crédito Solicitado: Lo que el usuario NECESITA (Precio - Enganche - Auto)
                    valorCredito: valorCreditoSolicitado,

                    // NUEVO NODO: El monto real que la API aprobó (oferta.monto_credito)
                    creditoDisponible: oferta.monto_credito,

                    detalleVehiculoPartePago: detalleAutoUsado,

                    mensualidades: {
                        plazo: oferta.plazo,
                        monto: oferta.descuento,
                        periodo: oferta.periodo,
                        tasaAnual: oferta.tasa_anual,
                        interesesTotales: interesesTotalesCalculados
                    }
                };

                sessionStorage.setItem('simulationData', JSON.stringify(this.seleccionUsuario));
                console.log("Valores guardados en storage " + sessionStorage.getItem('simulationData'));
            };

            // Evento de arrastre del slider
            if (this.handleRangeUpdate) this.elements.plazoRange.removeEventListener('input', this.handleRangeUpdate);
            this.handleRangeUpdate = (e) => updatePlazoUI(e.target.value);
            this.elements.plazoRange.addEventListener('input', this.handleRangeUpdate);

            // Inicialización al final
            updatePlazoUI(ultimoIndice);
        },

        init() {
            const handleConvenioChange = () => {
                const selectedValue = this.elements.convenio.value;
                const isPensionado = (selectedValue === '1000');
                const cfdiInputWrapper = document.getElementById('cfdiWrapper');
                const nsInputWrapper = document.getElementById('nsWrapper');

                if (isPensionado) {
                    if (cfdiInputWrapper) cfdiInputWrapper.style.display = 'none';
                    if (this.elements.cfdi) this.elements.cfdi.removeAttribute('required');
                    if (nsInputWrapper) nsInputWrapper.style.display = 'block';
                    if (this.elements.nsInput) this.elements.nsInput.setAttribute('required', 'true');
                } else {
                    if (nsInputWrapper) nsInputWrapper.style.display = 'none';
                    if (this.elements.nsInput) this.elements.nsInput.removeAttribute('required');
                    if (cfdiInputWrapper) cfdiInputWrapper.style.display = 'block';
                    if (this.elements.cfdi) this.elements.cfdi.setAttribute('required', 'true');
                }

                this.elements.solicitarBtn.disabled = true;
                if (this.elements.solicitarBtnMobile) this.elements.solicitarBtnMobile.disabled = true;

                this.checkSimulateButtonState();
            };

            this.elements.convenio.addEventListener('change', handleConvenioChange);

            this.elements.precioVehiculoManual.addEventListener('input', () => {
                this.precioVehiculoValue = Helpers.parseCurrency(this.elements.precioVehiculoManual.value);
                this.elements.precioVehiculoManual.value = Helpers.formatCurrency(this.precioVehiculoValue);
                SimuladorCredito.updateAporteInicial();
            });

            this.elements.aporteManual.addEventListener('input', () => {
                this.manualAporteValue = Helpers.parseCurrency(this.elements.aporteManual.value);
                const formatted = Helpers.formatCurrency(this.manualAporteValue);
                if (this.elements.aporteManual.value !== formatted) {
                    this.elements.aporteManual.value = formatted;
                }
                SimuladorCredito.updateAporteInicial();
            });

            const fieldsToWatch = [
                this.elements.convenio,
                this.elements.cfdi,
                this.elements.nsInput,
                this.elements.precioVehiculoManual,
                this.elements.aporteManual
            ];

            fieldsToWatch.forEach(field => {
                if (field) {
                    field.addEventListener('input', () => {
                        this.elements.solicitarBtn.disabled = true;
                        if (this.elements.solicitarBtnMobile) this.elements.solicitarBtnMobile.disabled = true;

                        this.checkSimulateButtonState();
                    });

                    field.addEventListener('change', () => {
                        this.checkSimulateButtonState();
                    });
                }
            });

            const cfdiInput = this.elements.cfdi;
            if (cfdiInput) cfdiInput.setAttribute('data-content', 'Seleccione un archivo');

            cfdiInput.addEventListener('change', (event) => {
                const input = event.target;
                if (input.files.length > 0) {
                    input.setAttribute('data-content', input.files[0].name);
                } else {
                    input.setAttribute('data-content', 'Seleccione un archivo');
                }
                this.checkSimulateButtonState();
            });

            this.elements.simulateBtn.addEventListener('click', this.handleSimulate.bind(this));

            this.elements.form.addEventListener('submit', (e) => {
                toggleModalError('modal-errors', 'Alerta', 'La solicitud de crédito será activada pronto...');
                return;
            });

            handleConvenioChange();

            this.checkSimulateButtonState();
        }
    };

    LibroAzul.init();
    SimuladorCredito.init();
    SimuladorCredito.updateAporteInicial();
});