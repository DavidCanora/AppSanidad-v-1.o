const ApiExplorerModule = {
    currentFile: null,
    currentEndpoint: "analyze",

    init() {
        this.expDot = document.getElementById("api-exp-dot");
        this.expStatus = document.getElementById("api-exp-status");
        this.uploadZone = document.getElementById("api-upload-zone");
        this.fileInput = document.getElementById("api-file-input");
        this.uploadContent = document.getElementById("api-upload-content");
        this.fileChosen = document.getElementById("api-file-chosen");
        this.fileName = document.getElementById("api-file-name");
        this.fileSize = document.getElementById("api-file-size");
        this.fileIcon = document.getElementById("api-file-icon");
        this.executeBtn = document.getElementById("api-execute-btn");
        this.healthBtn = document.getElementById("api-health-btn");
        this.responseCard = document.getElementById("api-response-card");
        this.jsonViewer = document.getElementById("api-json-viewer");
        this.statusBadge = document.getElementById("api-status-badge");
        this.responseTime = document.getElementById("api-response-time");
        this.responseSize = document.getElementById("api-response-size");
        this.loadingEl = document.getElementById("api-loading");
        this.copyBtn = document.getElementById("api-copy-btn");
        this.refreshBtn = document.getElementById("api-refresh-btn");

        this.registerEvents();
        this.checkConnection();
    },

    registerEvents() {
        document.querySelectorAll(".api-endpoint-card").forEach(card => {
            card.addEventListener("click", () => {
                document.querySelectorAll(".api-endpoint-card").forEach(c => c.classList.remove("active-endpoint"));
                card.classList.add("active-endpoint");
                const ep = card.dataset.endpoint;
                this.currentEndpoint = ep;
                document.getElementById("tester-analyze").style.display = ep === "analyze" ? "block" : "none";
                document.getElementById("tester-health").style.display = ep === "health" ? "block" : "none";
                this.responseCard.style.display = "none";
                this.loadingEl.style.display = "none";
            });
        });

        this.uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.uploadZone.classList.add("api-zone-hover");
        });

        this.uploadZone.addEventListener("dragleave", () => {
            this.uploadZone.classList.remove("api-zone-hover");
        });

        this.uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove("api-zone-hover");
            if (e.dataTransfer.files[0]) this.setFile(e.dataTransfer.files[0]);
        });

        this.fileInput.addEventListener("change", () => {
            if (this.fileInput.files[0]) this.setFile(this.fileInput.files[0]);
        });

        document.getElementById("api-remove-file").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.clearFile();
        });

        this.executeBtn.addEventListener("click", () => this.executeAnalyze());
        this.healthBtn.addEventListener("click", () => this.executeHealth());
        this.copyBtn.addEventListener("click", () => this.copyResponse());
        this.refreshBtn.addEventListener("click", () => this.checkConnection());
    },

    setFile(file) {
        this.currentFile = file;
        const isPdf = file.type === "application/pdf";
        this.fileIcon.textContent = isPdf ? "📄" : "🖼️";
        this.fileName.textContent = file.name;
        this.fileSize.textContent = (file.size / 1024).toFixed(1) + " KB";
        this.uploadContent.style.display = "none";
        this.fileChosen.style.display = "flex";

        const ext = file.name.split(".").pop().toLowerCase();
        const radios = document.querySelectorAll("input[name='api-format']");
        radios.forEach(r => { r.checked = r.value === ext || (ext === "jpg" && r.value === "jpeg"); });
    },

    clearFile() {
        this.currentFile = null;
        this.fileInput.value = "";
        this.uploadContent.style.display = "flex";
        this.fileChosen.style.display = "none";
    },

    async checkConnection() {
        if (this.expDot) {
            this.expDot.className = "api-server-dot api-server-dot--checking";
        }
        if (this.expStatus) this.expStatus.textContent = "Comprobando...";

        try {
            const r = await fetch(`${window.getApiBaseUrl()}/openapi.json`, { signal: AbortSignal.timeout(3000) });
            if (r.ok) {
                this.expDot.className = "api-server-dot api-server-dot--online";
                this.expStatus.textContent = "Conectado — FastAPI activo en :8000";
            } else {
                throw new Error();
            }
        } catch {
            this.expDot.className = "api-server-dot api-server-dot--offline";
            this.expStatus.textContent = "Sin conexión con el servidor";
        }
    },

    showLoading() {
        this.responseCard.style.display = "none";
        this.loadingEl.style.display = "flex";
        this.executeBtn.disabled = true;
    },

    hideLoading() {
        this.loadingEl.style.display = "none";
        this.executeBtn.disabled = false;
    },

    showResponse(status, data, ms) {
        this.hideLoading();
        const json = JSON.stringify(data, null, 2);
        this.jsonViewer.innerHTML = this.syntaxHighlight(json);
        this.statusBadge.textContent = status;
        this.statusBadge.className = "api-status-badge " + (status.startsWith("2") ? "api-status-badge--ok" : "api-status-badge--err");
        this.responseTime.textContent = ms + " ms";
        this.responseSize.textContent = new Blob([json]).size + " B";
        this.responseCard.style.display = "block";
        this.responseCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },

    async executeAnalyze() {
        if (!this.currentFile) {
            window.showToast("Selecciona un archivo antes de ejecutar.");
            return;
        }

        const formatType = document.querySelector("input[name='api-format']:checked")?.value || "pdf";
        const formData = new FormData();
        formData.append("file", this.currentFile, this.currentFile.name);
        formData.append("format_type", formatType);

        this.showLoading();
        const t0 = performance.now();

        try {
            const res = await fetch(`${window.getApiBaseUrl()}/api/v1/analyze`, {
                method: "POST",
                body: formData,
                signal: AbortSignal.timeout(45000)
            });

            const ms = Math.round(performance.now() - t0);
            const data = await res.json();
            this.showResponse(res.status + " " + res.statusText, data, ms);
            this.checkConnection();

        } catch (err) {
            this.hideLoading();
            this.showResponse("Error", { error: "No se pudo conectar con el servidor.", detail: err.message }, 0);
        }
    },

    async executeHealth() {
        this.showLoading();
        if (this.healthBtn) this.healthBtn.disabled = true;

        const t0 = performance.now();

        try {
            const res = await fetch(`${window.getApiBaseUrl()}/openapi.json`, {
                signal: AbortSignal.timeout(5000)
            });

            const ms = Math.round(performance.now() - t0);
            const data = await res.json();
            this.showResponse(res.status + " " + res.statusText, data, ms);

        } catch (err) {
            this.hideLoading();
            this.showResponse("Error", { error: "No se pudo conectar.", detail: err.message }, 0);
        } finally {
            if (this.healthBtn) this.healthBtn.disabled = false;
        }
    },

    copyResponse() {
        const text = this.jsonViewer.textContent;
        navigator.clipboard.writeText(text).then(() => {
            window.showToast("✓ JSON copiado al portapapeles");
        });
    },

    syntaxHighlight(json) {
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
            let cls = "json-num";
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? "json-key" : "json-str";
            } else if (/true|false/.test(match)) {
                cls = "json-bool";
            } else if (/null/.test(match)) {
                cls = "json-null";
            }
            return `<span class="${cls}">${match}</span>`;
        });
    }
};

window.ApiExplorerModule = ApiExplorerModule;
