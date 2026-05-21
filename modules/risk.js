/**
 * MÓDULO DE CALCULADORA DE RIESGO CLÍNICO Y EXPLICABILIDAD (XAI)
 * Calcula riesgo cardiovascular e ilustra la importancia de variables (SHAP/LIME)
 */

const RiskModule = {
    init() {
        // Elementos de entrada (Sliders y Checkboxes)
        this.sliderAge = document.getElementById("slider-age");
        this.sliderSbp = document.getElementById("slider-sbp");
        this.sliderChol = document.getElementById("slider-chol");
        this.sliderHdl = document.getElementById("slider-hdl");
        this.checkSmoker = document.getElementById("check-smoker");
        this.checkDiabetes = document.getElementById("check-diabetes");

        // Elementos de salida numérica de inputs
        this.valAge = document.getElementById("val-age");
        this.valSbp = document.getElementById("val-sbp");
        this.valChol = document.getElementById("val-chol");
        this.valHdl = document.getElementById("val-hdl");

        // Elementos de salida de resultados
        this.circleGauge = document.getElementById("risk-circle-gauge");
        this.riskPercentage = document.getElementById("risk-percentage");
        this.riskLabel = document.getElementById("risk-label");
        this.xaiBars = document.getElementById("xai-bars");

        this.registerEvents();
        this.calculateRisk(); // Cálculo inicial
    },

    registerEvents() {
        const inputs = [
            this.sliderAge, 
            this.sliderSbp, 
            this.sliderChol, 
            this.sliderHdl, 
            this.checkSmoker, 
            this.checkDiabetes
        ];

        inputs.forEach(input => {
            input.addEventListener("input", () => {
                this.updateLabelValues();
                this.calculateRisk();
            });
            // En algunos navegadores los checkboxes usan "change"
            input.addEventListener("change", () => {
                this.updateLabelValues();
                this.calculateRisk();
            });
        });
    },

    updateLabelValues() {
        this.valAge.innerText = this.sliderAge.value;
        this.valSbp.innerText = this.sliderSbp.value;
        this.valChol.innerText = this.sliderChol.value;
        this.valHdl.innerText = this.sliderHdl.value;
    },

    calculateRisk() {
        const age = parseInt(this.sliderAge.value);
        const sbp = parseInt(this.sliderSbp.value);
        const chol = parseInt(this.sliderChol.value);
        const hdl = parseInt(this.sliderHdl.value);
        const isSmoker = this.checkSmoker.checked;
        const isDiabetic = this.checkDiabetes.checked;

        // 1. Simulación matemática de aportación de factores (Framingham simplificado)
        const contribAge = Math.max(0, (age - 20) * 0.15); // Hasta ~9%
        const contribSbp = Math.max(0, (sbp - 90) * 0.22); // Hasta ~24%
        
        // Ratio Colesterol total / HDL (típico marcador de riesgo lipídico)
        const lipidRatio = chol / hdl;
        const contribLipids = Math.max(0, (lipidRatio - 2) * 2.5); // Hasta ~15%
        
        const contribSmoker = isSmoker ? 12 : 0; // +12% directo si fuma
        const contribDiabetes = isDiabetic ? 18 : 0; // +18% directo si tiene diabetes

        // Suma base más contribuciones
        let riskScore = 1.5 + contribAge + contribSbp + contribLipids + contribSmoker + contribDiabetes;
        
        // Limitar máximo a 95% y mínimo a 0.5%
        riskScore = Math.max(0.5, Math.min(95, riskScore));
        const formattedRisk = riskScore.toFixed(1);

        // 2. Clasificación Clínica de Riesgo
        let category = "Bajo";
        let color = "#10b981"; // Esmeralda
        
        if (riskScore >= 5 && riskScore < 10) {
            category = "Moderado";
            color = "#f59e0b"; // Ámbar
        } else if (riskScore >= 10 && riskScore < 20) {
            category = "Alto";
            color = "#f97316"; // Naranja
        } else if (riskScore >= 20) {
            category = "Muy Alto";
            color = "#ef4444"; // Rojo / Emergencia
        }

        // 3. Actualizar Indicador Circular de Aguja (Conic Gradient)
        this.riskPercentage.innerText = `${formattedRisk}%`;
        this.riskLabel.innerText = category;
        this.riskLabel.style.color = color;
        
        // Cambiar el anillo cónico usando la variable color
        this.circleGauge.style.background = `conic-gradient(${color} 0% ${riskScore}%, rgba(255, 255, 255, 0.05) ${riskScore}% 100%)`;
        this.circleGauge.style.boxShadow = `0 0 20px ${color}33`; // Brillo sutil

        // 4. Explicabilidad IA (Gráficos XAI de barras)
        // Calculamos contribuciones relativas en escala 0-100 para mostrarlas en barra
        const totalContrib = contribAge + contribSbp + contribLipids + contribSmoker + contribDiabetes || 1;
        
        const factors = [
            { label: "Edad", val: contribAge },
            { label: "Presión Arterial", val: contribSbp },
            { label: "Perfil Lipídico", val: contribLipids },
            { label: "Tabaquismo", val: contribSmoker },
            { label: "Diabetes", val: contribDiabetes }
        ];

        this.xaiBars.innerHTML = "";
        factors.forEach(f => {
            // Peso relativo para el ancho de la barra
            const weight = ((f.val / totalContrib) * 100).toFixed(0);
            
            const barGroup = document.createElement("div");
            barGroup.className = "xai-bar-group";
            barGroup.innerHTML = `
                <span class="xai-bar-label">${f.label}</span>
                <div class="xai-bar-track">
                    <div class="xai-bar-fill" style="width: ${weight}%; background: ${color};"></div>
                </div>
                <span style="font-size: 0.8rem; font-weight: 500; min-width: 32px; text-align: right;">${weight}%</span>
            `;
            this.xaiBars.appendChild(barGroup);
        });
    }
};

window.RiskModule = RiskModule;
