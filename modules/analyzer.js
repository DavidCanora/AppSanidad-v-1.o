/**
 * MÓDULO DE ANALIZADOR DE IMÁGENES Y BIOMARCADORES
 * Simula el análisis de imágenes por visión artificial y analítica de sangre
 */

const AnalyzerModule = {
    // Datos de biomarcadores simulados
    biomarkers: [
        { name: "Hemoglobina", value: "11.2", unit: "g/dL", ref: "12.0 - 16.0", status: "low", statusTxt: "Bajo" },
        { name: "Glucosa en Ayunas", value: "142", unit: "mg/dL", ref: "70 - 100", status: "high", statusTxt: "Crítico" },
        { name: "Colesterol Total", value: "195", unit: "mg/dL", ref: "< 200", status: "normal", statusTxt: "Normal" },
        { name: "Glóbulos Blancos (Leucocitos)", value: "14,500", unit: "uL", ref: "4,500 - 11,000", status: "high", statusTxt: "Crítico" },
        { name: "Creatinina", value: "0.85", unit: "mg/dL", ref: "0.50 - 1.10", status: "normal", statusTxt: "Normal" },
        { name: "Potasio", value: "4.2", unit: "mEq/L", ref: "3.5 - 5.1", status: "normal", statusTxt: "Normal" }
    ],

    init() {
        this.scanBtn = document.getElementById("scan-btn");
        this.scanLaser = document.getElementById("scan-laser");
        this.boxLung = document.getElementById("box-left-lung");
        this.boxCardio = document.getElementById("box-cardiomegaly");
        this.biomarkersBody = document.getElementById("biomarkers-body");
        this.biomarkerAlert = document.getElementById("biomarker-alert");

        this.registerEvents();
        this.renderBiomarkers(false); // Renderizar sin alertas al inicio
    },

    registerEvents() {
        this.scanBtn.addEventListener("click", () => this.startScan());
    },

    renderBiomarkers(showAnalysis = false) {
        this.biomarkersBody.innerHTML = "";
        
        this.biomarkers.forEach(b => {
            const tr = document.createElement("tr");
            
            // Decidir clases y estado a pintar en base a si se ha analizado o no
            let statusBadge = `<span class="badge-status normal">Normal</span>`;
            
            if (showAnalysis) {
                if (b.status === "high") {
                    statusBadge = `<span class="badge-status high">↑ ${b.statusTxt}</span>`;
                } else if (b.status === "low") {
                    statusBadge = `<span class="badge-status low">↓ ${b.statusTxt}</span>`;
                }
            } else {
                // Estado inicial plano
                statusBadge = `<span class="badge-status normal">Normal</span>`;
            }

            // Cambiar el valor visual en el inicio para simular "procesamiento"
            const displayValue = showAnalysis ? b.value : (b.status === "normal" ? b.value : "—");

            tr.innerHTML = `
                <td><strong>${b.name}</strong></td>
                <td>${displayValue} ${displayValue !== "—" ? b.unit : ""}</td>
                <td>${b.ref} ${b.unit}</td>
                <td>${statusBadge}</td>
            `;
            this.biomarkersBody.appendChild(tr);
        });

        // Mostrar alerta general de biomarcadores si se hizo el escaneo
        if (showAnalysis) {
            this.biomarkerAlert.style.display = "block";
        } else {
            this.biomarkerAlert.style.display = "none";
        }
    },

    startScan() {
        // Deshabilitar botón durante el escaneo
        this.scanBtn.disabled = true;
        this.scanBtn.innerText = "Analizando...";
        
        // Limpiar cajas de detección
        this.boxLung.style.display = "none";
        this.boxCardio.style.display = "none";
        this.renderBiomarkers(false);

        // Activar láser y animación
        this.scanLaser.style.display = "block";
        this.scanLaser.style.animation = "scanEffect 2s linear infinite";

        setTimeout(() => {
            // Detener escaneo tras 2.5s
            this.scanLaser.style.display = "none";
            this.scanLaser.style.animation = "";
            
            // Mostrar hallazgos en la radiografía
            this.boxLung.style.display = "block";
            this.boxCardio.style.display = "block";

            // Renderizar biomarcadores revelando anomalías críticas
            this.renderBiomarkers(true);

            // Reactivar botón
            this.scanBtn.disabled = false;
            this.scanBtn.innerText = "Escanear de Nuevo";
        }, 2500);
    }
};

window.AnalyzerModule = AnalyzerModule;
