const AnalyzerModule = {
    currentFile: null,

    cases: {
        control: [
            { name: "Hemoglobina", value: "11.2 g/dL", ref: "12.0 - 16.0 g/dL", status: "low", statusTxt: "Bajo" },
            { name: "Glucosa en Ayunas", value: "142 mg/dL", ref: "70 - 100 mg/dL", status: "high", statusTxt: "Crítico" },
            { name: "Colesterol Total", value: "195 mg/dL", ref: "< 200 mg/dL", status: "normal", statusTxt: "Normal" },
            { name: "Glóbulos Blancos (Leucocitos)", value: "14,500 uL", ref: "4,500 - 11,000 uL", status: "high", statusTxt: "Crítico" },
            { name: "Creatinina", value: "0.85 mg/dL", ref: "0.50 - 1.10 mg/dL", status: "normal", statusTxt: "Normal" },
            { name: "Potasio", value: "4.2 mEq/L", ref: "3.5 - 5.1 mEq/L", status: "normal", statusTxt: "Normal" }
        ],
        pti: [
            { name: "Plaquetas (Conteo)", value: "14,000 uL", ref: "150,000 - 450,000 uL", status: "high", statusTxt: "Crítico" },
            { name: "Hemoglobina", value: "12.5 g/dL", ref: "12.0 - 16.0 g/dL", status: "normal", statusTxt: "Normal" },
            { name: "Glóbulos Blancos (Leucocitos)", value: "7,200 uL", ref: "4,500 - 11,000 uL", status: "normal", statusTxt: "Normal" },
            { name: "Anticuerpos Antiplaquetarios (IgG)", value: "Positivo", ref: "Negativo", status: "high", statusTxt: "Crítico" },
            { name: "Tiempo de Protrombina (TP)", value: "12.1 seg", ref: "11.0 - 13.5 seg", status: "normal", statusTxt: "Normal" },
            { name: "TTPa", value: "31.2 seg", ref: "25.0 - 35.0 seg", status: "normal", statusTxt: "Normal" }
        ]
    },

    biomarkers: [],
    currentFilter: "normal",

    init() {
        this.scanBtn       = document.getElementById("scan-btn");
        this.scanLaser     = document.getElementById("scan-laser");
        this.boxLung       = document.getElementById("box-left-lung");
        this.boxCardio     = document.getElementById("box-cardiomegaly");
        this.biomarkersBody= document.getElementById("biomarkers-body");
        this.biomarkerAlert= document.getElementById("biomarker-alert");
        this.caseSelect    = document.getElementById("case-study-select");
        this.ptiDetailsPanel = document.getElementById("pti-details-panel");
        this.uploadZone    = document.getElementById("upload-zone");
        this.fileUploader  = document.getElementById("file-uploader");
        this.fileDetails   = document.getElementById("file-details");
        this.fileDetailIcon= document.getElementById("file-detail-icon");
        this.fileDetailName= document.getElementById("file-detail-name");
        this.fileDetailSize= document.getElementById("file-detail-size");
        this.progressFill  = document.getElementById("upload-progress-fill");
        this.removeFileBtn = document.getElementById("remove-file-btn");
        this.xrayImage     = document.getElementById("xray-image");
        this.xrayContainer = document.getElementById("xray-container");
        this.dicomViewer   = document.getElementById("dicom-viewer");
        this.dicomFilterLabel = document.getElementById("dicom-filter-label");
        this.dicomDate     = document.getElementById("dicom-date");

        this.biomarkers = this.cases.control;

        this.registerEvents();
        this.renderBiomarkers(false);

        if (this.dicomViewer) this.dicomViewer.style.display = "none";
        if (this.boxLung)    this.boxLung.style.display = "none";
        if (this.boxCardio)  this.boxCardio.style.display = "none";
    },

    registerEvents() {
        this.scanBtn.addEventListener("click", () => this.startScan());

        this.caseSelect.addEventListener("change", () => {
            const val = this.caseSelect.value;
            this.biomarkers = this.cases[val];
            this.renderBiomarkers(false);
            this.ptiDetailsPanel.style.display = val === "pti" ? "block" : "none";
        });

        this.uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.uploadZone.classList.add("dragover");
        });

        this.uploadZone.addEventListener("dragleave", () => {
            this.uploadZone.classList.remove("dragover");
        });

        this.uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove("dragover");
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileSelected(file);
        });

        this.fileUploader.addEventListener("change", () => {
            if (this.fileUploader.files[0]) {
                this.handleFileSelected(this.fileUploader.files[0]);
            }
        });

        this.removeFileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.resetFileState();
        });

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.applyImageFilter(btn.dataset.filter);
            });
        });

        const dashUploadZone = document.getElementById("dashboard-upload-zone");
        const dashFileInput  = document.getElementById("dashboard-file-input");

        if (dashUploadZone) {
            dashUploadZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dashUploadZone.classList.add("dragover");
            });
            dashUploadZone.addEventListener("dragleave", () => {
                dashUploadZone.classList.remove("dragover");
            });
            dashUploadZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dashUploadZone.classList.remove("dragover");
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileSelected(file);
                    if (window.switchTab) window.switchTab("section-analyzer");
                }
            });
        }

        if (dashFileInput) {
            dashFileInput.addEventListener("change", () => {
                if (dashFileInput.files[0]) {
                    this.handleFileSelected(dashFileInput.files[0]);
                    if (window.switchTab) window.switchTab("section-analyzer");
                }
            });
        }
    },

    handleFileSelected(file) {
        const allowed = ["application/pdf", "image/png", "image/jpeg"];
        if (!allowed.includes(file.type)) {
            window.showToast("Formato no admitido. Usa PDF, PNG o JPG.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            window.showToast("El archivo supera el límite de 10 MB.");
            return;
        }

        this.currentFile = file;
        this.uploadZone.style.display = "none";
        this.fileDetails.style.display = "block";

        const isPdf = file.type === "application/pdf";
        this.fileDetailIcon.textContent = isPdf ? "📄" : "🖼️";
        this.fileDetailName.textContent = file.name;
        this.fileDetailSize.textContent = (file.size / 1024).toFixed(1) + " KB";

        this.progressFill.style.width = "0%";
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                window.showToast("Archivo listo. Pulsa «Escanear con IA» para analizar.");
            }
            this.progressFill.style.width = Math.min(progress, 100) + "%";
        }, 120);

        if (!isPdf) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.xrayImage.src = ev.target.result;
                if (this.dicomViewer) this.dicomViewer.style.display = "block";
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, "0");
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const yy = today.getFullYear();
                if (this.dicomDate) this.dicomDate.textContent = `FECHA: ${dd}/${mm}/${yy}`;
                this.applyImageFilter(this.currentFilter);
            };
            reader.readAsDataURL(file);
        } else {
            if (this.dicomViewer) this.dicomViewer.style.display = "none";
        }
    },

    resetFileState() {
        this.currentFile = null;
        this.fileUploader.value = "";
        this.uploadZone.style.display = "flex";
        this.fileDetails.style.display = "none";
        this.progressFill.style.width = "0%";
        this.xrayImage.src = "assets/xray.png";
        if (this.dicomViewer) this.dicomViewer.style.display = "none";
        if (this.dicomDate) this.dicomDate.textContent = "FECHA: --/--/----";
        if (this.boxLung)   this.boxLung.style.display = "none";
        if (this.boxCardio) this.boxCardio.style.display = "none";
        this.scanBtn.disabled = false;
        this.scanBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Escanear con IA`;
        this.biomarkers = this.cases.control;
        this.renderBiomarkers(false);
    },

    applyImageFilter(filterName) {
        this.currentFilter = filterName;
        const img = this.xrayImage;
        const container = this.xrayContainer;
        const label = this.dicomFilterLabel;

        img.className = "";
        container.classList.remove("heatmap-active");

        const filterMap = {
            normal:   { cls: "filter-normal",   label: "FILTRO: ESTÁNDAR" },
            contrast: { cls: "filter-contrast",  label: "FILTRO: ALTO CONTRASTE" },
            invert:   { cls: "filter-invert",    label: "FILTRO: NEGATIVO" },
            heatmap:  { cls: "filter-heatmap",   label: "FILTRO: MAPA DE CALOR" }
        };

        const selected = filterMap[filterName] || filterMap.normal;
        img.classList.add(selected.cls);
        if (filterName === "heatmap") container.classList.add("heatmap-active");
        if (label) label.textContent = selected.label;
    },

    renderBiomarkers(showAnalysis = false) {
        this.biomarkersBody.innerHTML = "";

        this.biomarkers.forEach(b => {
            const tr = document.createElement("tr");

            let statusBadge;
            if (!showAnalysis) {
                statusBadge = '<span class="badge-status normal">—</span>';
            } else if (b.status === "high") {
                statusBadge = `<span class="badge-status high">↑ ${b.statusTxt}</span>`;
            } else if (b.status === "low") {
                statusBadge = `<span class="badge-status low">↓ ${b.statusTxt}</span>`;
            } else {
                statusBadge = '<span class="badge-status normal">Normal</span>';
            }

            const displayValue = showAnalysis ? b.value : "—";

            tr.innerHTML = `
                <td><strong>${b.name}</strong></td>
                <td>${displayValue}</td>
                <td>${b.ref}</td>
                <td>${statusBadge}</td>
            `;
            this.biomarkersBody.appendChild(tr);
        });

        const hasCritical = showAnalysis && this.biomarkers.some(b => b.status !== "normal");
        this.biomarkerAlert.style.display = hasCritical ? "flex" : "none";
    },

    async startScan() {
        if (!this.currentFile) {
            window.showToast("Sube un archivo primero para poder analizarlo.");
            return;
        }

        this.scanBtn.disabled = true;
        this.scanBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analizando...`;

        if (this.boxLung)   this.boxLung.style.display = "none";
        if (this.boxCardio) this.boxCardio.style.display = "none";
        this.renderBiomarkers(false);

        if (this.scanLaser) {
            this.scanLaser.style.display = "block";
            this.scanLaser.style.animation = "scanEffect 2s linear infinite";
        }

        const isImage = this.currentFile.type !== "application/pdf";
        const ext = this.currentFile.name.split(".").pop().toLowerCase();
        const startTime = Date.now();

        try {
            const formData = new FormData();
            formData.append("file", this.currentFile, this.currentFile.name);
            formData.append("format_type", ext);

            const res = await fetch(`${window.getApiBaseUrl()}/api/v1/analyze`, {
                method: "POST",
                body: formData,
                signal: AbortSignal.timeout(45000)
            });

            if (!res.ok) throw new Error("Backend HTTP " + res.status);

            const data = await res.json();

            this.biomarkers = data.map(item => {
                const requiresAttention = item.requiere_atencion;
                return {
                    name: item.biomarcador,
                    value: item.valor_medido,
                    ref: item.rango_normal,
                    status: requiresAttention ? "high" : "normal",
                    statusTxt: requiresAttention ? "Crítico" : "Normal"
                };
            });

            window.showToast("✓ Análisis IA completado");

        } catch (err) {
            const currentCase = this.caseSelect.value;
            this.biomarkers = this.cases[currentCase];
            window.showToast("Backend offline — mostrando caso de demo.");
        }

        const elapsed = Date.now() - startTime;
        const remaining = 2200 - elapsed;
        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }

        if (this.scanLaser) {
            this.scanLaser.style.display = "none";
            this.scanLaser.style.animation = "";
        }
        this.renderBiomarkers(true);
        this.scanBtn.disabled = false;
        this.scanBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Escanear de Nuevo`;
    }
};

window.AnalyzerModule = AnalyzerModule;
