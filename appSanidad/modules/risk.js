const RiskModule = {
    init() {
        this.sliderAge = document.getElementById("slider-age");
        this.sliderSbp = document.getElementById("slider-sbp");
        this.sliderChol = document.getElementById("slider-chol");
        this.sliderHdl = document.getElementById("slider-hdl");
        this.checkSmoker = document.getElementById("check-smoker");
        this.checkDiabetes = document.getElementById("check-diabetes");
        this.valAge = document.getElementById("val-age");
        this.valSbp = document.getElementById("val-sbp");
        this.valChol = document.getElementById("val-chol");
        this.valHdl = document.getElementById("val-hdl");
        this.circleGauge = document.getElementById("risk-circle-gauge");
        this.riskPercentage = document.getElementById("risk-percentage");
        this.riskLabel = document.getElementById("risk-label");
        this.xaiBars = document.getElementById("xai-bars");

        this.registerEvents();
        this.calculateRisk();
    },

    registerEvents() {
        [this.sliderAge, this.sliderSbp, this.sliderChol, this.sliderHdl].forEach(input => {
            input.addEventListener("input", () => {
                this.updateLabelValues();
                this.calculateRisk();
            });
        });

        [this.checkSmoker, this.checkDiabetes].forEach(input => {
            input.addEventListener("change", () => this.calculateRisk());
        });
    },

    updateLabelValues() {
        this.valAge.innerText = this.sliderAge.value;
        this.valSbp.innerText = this.sliderSbp.value;
        this.valChol.innerText = this.sliderChol.value;
        this.valHdl.innerText = this.sliderHdl.value;
    },

    calculateRisk() {
        const params = this._readInputs();
        const contributions = this._computeContributions(params);
        const riskScore = this._clampScore(
            1.5 + contributions.age + contributions.sbp + contributions.lipids + contributions.smoker + contributions.diabetes
        );
        const category = this._classify(riskScore);

        this._renderGauge(riskScore, category);
        this._renderXaiBars(contributions, category.color);
    },

    _readInputs() {
        return {
            age: parseInt(this.sliderAge.value),
            sbp: parseInt(this.sliderSbp.value),
            chol: parseInt(this.sliderChol.value),
            hdl: parseInt(this.sliderHdl.value),
            isSmoker: this.checkSmoker.checked,
            isDiabetic: this.checkDiabetes.checked
        };
    },

    _computeContributions(p) {
        const lipidRatio = p.chol / p.hdl;
        return {
            age: Math.max(0, (p.age - 20) * 0.15),
            sbp: Math.max(0, (p.sbp - 90) * 0.22),
            lipids: Math.max(0, (lipidRatio - 2) * 2.5),
            smoker: p.isSmoker ? 12 : 0,
            diabetes: p.isDiabetic ? 18 : 0
        };
    },

    _clampScore(score) {
        return Math.max(0.5, Math.min(95, score));
    },

    _classify(score) {
        if (score >= 20) return { label: "Muy Alto", color: "#ef4444" };
        if (score >= 10) return { label: "Alto", color: "#f97316" };
        if (score >= 5)  return { label: "Moderado", color: "#f59e0b" };
        return { label: "Bajo", color: "#10b981" };
    },

    _renderGauge(score, category) {
        this.riskPercentage.innerText = `${score.toFixed(1)}%`;
        this.riskLabel.innerText = category.label;
        this.riskLabel.style.color = category.color;
        this.circleGauge.style.background =
            `conic-gradient(${category.color} 0% ${score}%, rgba(255,255,255,0.05) ${score}% 100%)`;
        this.circleGauge.style.boxShadow = `0 0 24px ${category.color}30`;
    },

    _renderXaiBars(contributions, color) {
        const total = Object.values(contributions).reduce((a, b) => a + b, 0) || 1;
        const factors = [
            { label: "Edad", val: contributions.age },
            { label: "Presión Arterial", val: contributions.sbp },
            { label: "Perfil Lipídico", val: contributions.lipids },
            { label: "Tabaquismo", val: contributions.smoker },
            { label: "Diabetes", val: contributions.diabetes }
        ];

        this.xaiBars.innerHTML = "";
        factors.forEach(f => {
            const weight = ((f.val / total) * 100).toFixed(0);
            const group = document.createElement("div");
            group.className = "xai-bar-group";
            group.innerHTML = `
                <span class="xai-bar-label">${f.label}</span>
                <div class="xai-bar-track">
                    <div class="xai-bar-fill" style="width: ${weight}%; background: ${color};"></div>
                </div>
                <span style="font-size:0.78rem;font-weight:600;min-width:34px;text-align:right;font-family:var(--text-mono);">${weight}%</span>
            `;
            this.xaiBars.appendChild(group);
        });
    }
};

window.RiskModule = RiskModule;
