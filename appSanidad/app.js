document.addEventListener("DOMContentLoaded", () => {
    if (window.AuthModule) window.AuthModule.init();
    if (window.TriageModule) window.TriageModule.init();
    if (window.AnalyzerModule) window.AnalyzerModule.init();
    if (window.RiskModule) window.RiskModule.init();
    if (window.ApiExplorerModule) window.ApiExplorerModule.init();

    checkApiStatus();

    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".app-section");
    const sidebar = document.querySelector(".sidebar");

    function activateTab(targetId) {
        navButtons.forEach(b => b.classList.remove("active"));
        sections.forEach(sec => {
            sec.classList.remove("active");
            if (sec.id === targetId) sec.classList.add("active");
        });
        const matchingBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
        if (matchingBtn) matchingBtn.classList.add("active");
        sidebar.classList.remove("open");
    }

    window.switchTab = activateTab;

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => activateTab(btn.getAttribute("data-target")));
    });

    document.querySelectorAll(".module-quick-card").forEach(card => {
        card.addEventListener("click", () => {
            const target = card.getAttribute("data-target");
            if (target) activateTab(target);
        });
    });

    const menuToggle = document.getElementById("mobile-menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 968 && sidebar.classList.contains("open")) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove("open");
            }
        }
    });

    const qrBtn = document.getElementById("mobile-qr-btn");
    const qrModal = document.getElementById("qr-modal");
    const closeQrModal = document.getElementById("close-qr-modal");
    const qrImage = document.getElementById("qr-image");
    const qrIpAddress = document.getElementById("qr-ip-address");
    const TUNNEL_URL = "https://slow-wolves-fetch.loca.lt";

    if (qrBtn && qrModal) {
        qrBtn.addEventListener("click", () => {
            let targetUrl = TUNNEL_URL;
            const isLocal =
                window.location.protocol === "file:" ||
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1";

            if (!isLocal) {
                targetUrl = window.location.origin;
            }

            qrIpAddress.innerHTML = `${targetUrl}<br><span style="font-size:0.72rem;color:#30d158;font-family:monospace;">🌐 Túnel activo — funciona en cualquier red</span>`;
            qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;
            qrModal.classList.add("active");
        });

        closeQrModal.addEventListener("click", () => qrModal.classList.remove("active"));
        qrModal.addEventListener("click", (e) => { if (e.target === qrModal) qrModal.classList.remove("active"); });
    }

    const loginGate = document.getElementById("login-gate");
    const loginForm = document.getElementById("login-form");
    const loginUsernameInput = document.getElementById("login-username");
    const loginPasswordInput = document.getElementById("login-password");
    const quickLoginGrid = document.getElementById("quick-login-grid");

    const profileWidget = document.getElementById("doctor-profile-widget");
    const profileAvatar = document.getElementById("doctor-profile-avatar");
    const profileName = document.getElementById("doctor-profile-name");
    const profileSpecialty = document.getElementById("doctor-profile-specialty");
    const logoutBtn = document.getElementById("logout-btn");

    const historyTableBody = document.getElementById("history-table-body");
    const historySearchInput = document.getElementById("history-search-input");
    const historyPriorityFilter = document.getElementById("history-priority-filter");
    
    const statTotalCases = document.getElementById("stat-total-cases");
    const statCriticalCases = document.getElementById("stat-critical-cases");
    const statLastUpdate = document.getElementById("stat-last-update");

    const addCaseModal = document.getElementById("add-case-modal");
    const addCaseForm = document.getElementById("add-case-form");
    const addManualCaseBtn = document.getElementById("add-manual-case-btn");
    const closeAddCaseModal = document.getElementById("close-add-case-modal");
    const cancelAddCaseBtn = document.getElementById("cancel-add-case-btn");

    const casePatientName = document.getElementById("case-patient-name");
    const casePatientAge = document.getElementById("case-patient-age");
    const caseTestType = document.getElementById("case-test-type");
    const casePriority = document.getElementById("case-priority");
    const caseDiagnosis = document.getElementById("case-diagnosis");
    const caseReport = document.getElementById("case-report");

    const viewReportModal = document.getElementById("view-report-modal");
    const closeViewReportModal = document.getElementById("close-view-report-modal");
    const closeReportViewBtn = document.getElementById("close-report-view-btn");
    const reportModalTitle = document.getElementById("report-modal-title");
    const reportDetailPatient = document.getElementById("report-detail-patient");
    const reportDetailAge = document.getElementById("report-detail-age");
    const reportDetailType = document.getElementById("report-detail-type");
    const reportDetailDate = document.getElementById("report-detail-date");
    const reportDetailPriority = document.getElementById("report-detail-priority");
    const reportDetailDiagnosis = document.getElementById("report-detail-diagnosis");
    const reportDetailBody = document.getElementById("report-detail-body");

    const registerDoctorModal = document.getElementById("register-doctor-modal");
    const registerDoctorForm = document.getElementById("register-doctor-form");
    const registerNewDoctorBtn = document.getElementById("register-new-doctor-btn");
    const loginRegisterBtn = document.getElementById("login-register-btn");
    const closeRegisterDoctorModal = document.getElementById("close-register-doctor-modal");
    const cancelRegisterDoctorBtn = document.getElementById("cancel-register-doctor-btn");

    const regUsername = document.getElementById("reg-username");
    const regPassword = document.getElementById("reg-password");
    const regName = document.getElementById("reg-name");
    const regSpecialty = document.getElementById("reg-specialty");
    const regAvatar = document.getElementById("reg-avatar");

    function renderQuickLogin() {
        if (!quickLoginGrid) return;
        quickLoginGrid.innerHTML = "";
        const doctors = window.AuthModule.getDoctors();
        doctors.forEach(doc => {
            const card = document.createElement("div");
            card.className = "quick-login-card";
            card.innerHTML = `
                <div class="quick-avatar">${doc.avatar}</div>
                <div class="quick-info">
                    <span class="quick-name">${doc.name}</span>
                    <span class="quick-specialty">${doc.specialty}</span>
                </div>
            `;
            card.addEventListener("click", () => {
                try {
                    const activeDoc = window.AuthModule.login(doc.username, "1234");
                    window.showToast(`Bienvenido de nuevo, ${activeDoc.name}`);
                    updateAuthState();
                } catch (err) {
                    loginUsernameInput.value = doc.username;
                    loginPasswordInput.value = "";
                    loginPasswordInput.focus();
                    window.showToast("Introduce la contraseña para este perfil.");
                }
            });
            quickLoginGrid.appendChild(card);
        });
    }

    function updateAuthState() {
        const activeDoc = window.AuthModule.getActiveDoctor();
        if (activeDoc) {
            loginGate.style.display = "none";
            profileWidget.style.display = "flex";
            profileAvatar.textContent = activeDoc.avatar;
            profileName.textContent = activeDoc.name;
            profileSpecialty.textContent = activeDoc.specialty;
            renderHistory();
        } else {
            loginGate.style.display = "flex";
            profileWidget.style.display = "none";
            renderQuickLogin();
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value;
            try {
                const activeDoc = window.AuthModule.login(username, password);
                window.showToast(`Bienvenido, ${activeDoc.name}`);
                loginUsernameInput.value = "";
                loginPasswordInput.value = "";
                updateAuthState();
            } catch (err) {
                window.showToast(err.message);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.AuthModule.logout();
            window.showToast("Sesión cerrada correctamente.");
            updateAuthState();
            activateTab("section-dashboard");
        });
    }

    function renderHistory() {
        const activeDoc = window.AuthModule.getActiveDoctor();
        if (!activeDoc || !historyTableBody) return;

        const records = window.AuthModule.getRecords(activeDoc.username);
        const searchQuery = historySearchInput ? historySearchInput.value.toLowerCase().trim() : "";
        const priorityFilter = historyPriorityFilter ? historyPriorityFilter.value : "all";

        const filtered = records.filter(r => {
            const matchesSearch = !searchQuery || 
                r.patientName.toLowerCase().includes(searchQuery) ||
                r.diagnosis.toLowerCase().includes(searchQuery) ||
                r.testType.toLowerCase().includes(searchQuery);

            const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });

        updateStatistics(records);

        if (filtered.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="placeholder-text" style="text-align: center; padding: 32px;">
                        No se encontraron registros clínicos que coincidan con los filtros.
                    </td>
                </tr>
            `;
            return;
        }

        historyTableBody.innerHTML = "";
        filtered.forEach(r => {
            const tr = document.createElement("tr");
            
            let priorityLabel = "No Urgente";
            if (r.priority === "emergency") priorityLabel = "Emergencia (Nivel 1)";
            else if (r.priority === "very-urgent") priorityLabel = "Muy Urgente (Nivel 2)";
            else if (r.priority === "urgent") priorityLabel = "Urgente (Nivel 3)";
            else if (r.priority === "less-urgent") priorityLabel = "Menos Urgente (Nivel 4)";

            tr.innerHTML = `
                <td>${r.date.split(",")[0]}</td>
                <td><strong>${r.patientName}</strong></td>
                <td>${r.patientAge} años</td>
                <td>${r.testType}</td>
                <td><span class="priority-badge ${r.priority}">${priorityLabel}</span></td>
                <td>${r.diagnosis}</td>
                <td style="text-align: right;">
                    <div class="history-row-actions">
                        <button class="action-btn-sm action-btn-sm--view" data-id="${r.id}">Ver</button>
                        <button class="action-btn-sm action-btn-sm--delete" data-id="${r.id}">Eliminar</button>
                    </div>
                </td>
            `;

            tr.querySelector(".action-btn-sm--view").addEventListener("click", () => {
                showReportDetail(r);
            });

            tr.querySelector(".action-btn-sm--delete").addEventListener("click", () => {
                if (confirm(`¿Está seguro de que desea eliminar el registro de ${r.patientName}?`)) {
                    window.AuthModule.deleteRecord(activeDoc.username, r.id);
                    window.showToast("Registro eliminado.");
                    renderHistory();
                }
            });

            historyTableBody.appendChild(tr);
        });
    }

    function updateStatistics(records) {
        if (!statTotalCases || !statCriticalCases || !statLastUpdate) return;
        
        statTotalCases.textContent = records.length;
        
        const criticalCount = records.filter(r => r.priority === "emergency" || r.priority === "very-urgent").length;
        statCriticalCases.textContent = criticalCount;
        
        if (records.length > 0) {
            statLastUpdate.textContent = records[0].date.split(" ")[1] || "--:--";
        } else {
            statLastUpdate.textContent = "--:--";
        }
    }

    function showReportDetail(r) {
        if (!viewReportModal) return;

        let priorityLabel = "No Urgente";
        if (r.priority === "emergency") priorityLabel = "Emergencia (Nivel 1)";
        else if (r.priority === "very-urgent") priorityLabel = "Muy Urgente (Nivel 2)";
        else if (r.priority === "urgent") priorityLabel = "Urgente (Nivel 3)";
        else if (r.priority === "less-urgent") priorityLabel = "Menos Urgente (Nivel 4)";

        reportDetailPatient.textContent = r.patientName;
        reportDetailAge.textContent = `${r.patientAge} años`;
        reportDetailType.textContent = r.testType;
        reportDetailDate.textContent = r.date;
        reportDetailPriority.innerHTML = `<span class="priority-badge ${r.priority}">${priorityLabel}</span>`;
        reportDetailDiagnosis.textContent = r.diagnosis;
        reportDetailBody.textContent = r.report;

        viewReportModal.classList.add("active");
    }

    if (historySearchInput) {
        historySearchInput.addEventListener("input", renderHistory);
    }
    if (historyPriorityFilter) {
        historyPriorityFilter.addEventListener("change", renderHistory);
    }

    if (addManualCaseBtn) {
        addManualCaseBtn.addEventListener("click", () => {
            addCaseForm.reset();
            addCaseModal.classList.add("active");
        });
    }

    function closeCaseModal() {
        addCaseModal.classList.remove("active");
        addCaseForm.reset();
    }

    if (closeAddCaseModal) closeAddCaseModal.addEventListener("click", closeCaseModal);
    if (cancelAddCaseBtn) cancelAddCaseBtn.addEventListener("click", closeCaseModal);

    if (addCaseForm) {
        addCaseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const activeDoc = window.AuthModule.getActiveDoctor();
            if (!activeDoc) return;

            const record = {
                patientName: casePatientName.value.trim(),
                patientAge: parseInt(casePatientAge.value),
                testType: caseTestType.value.trim(),
                priority: casePriority.value,
                diagnosis: caseDiagnosis.value.trim(),
                report: caseReport.value.trim()
            };

            window.AuthModule.addRecord(activeDoc.username, record);
            window.showToast("✓ Registro guardado correctamente");
            closeCaseModal();
            renderHistory();
        });
    }

    if (closeViewReportModal) {
        closeViewReportModal.addEventListener("click", () => viewReportModal.classList.remove("active"));
    }
    if (closeReportViewBtn) {
        closeReportViewBtn.addEventListener("click", () => viewReportModal.classList.remove("active"));
    }

    if (registerNewDoctorBtn) {
        registerNewDoctorBtn.addEventListener("click", () => {
            registerDoctorForm.reset();
            registerDoctorModal.classList.add("active");
        });
    }

    if (loginRegisterBtn) {
        loginRegisterBtn.addEventListener("click", () => {
            registerDoctorForm.reset();
            registerDoctorModal.classList.add("active");
        });
    }

    function closeRegisterModal() {
        registerDoctorModal.classList.remove("active");
        registerDoctorForm.reset();
    }

    if (closeRegisterDoctorModal) closeRegisterDoctorModal.addEventListener("click", closeRegisterModal);
    if (cancelRegisterDoctorBtn) cancelRegisterDoctorBtn.addEventListener("click", closeRegisterModal);

    if (registerDoctorForm) {
        registerDoctorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = regUsername.value.trim();
            const password = regPassword.value;
            const name = regName.value.trim();
            const specialty = regSpecialty.value.trim();
            const avatar = regAvatar.value;

            try {
                window.AuthModule.registerDoctor(username, password, name, specialty, avatar);
                window.showToast("✓ Perfil médico registrado");
                closeRegisterModal();
                renderQuickLogin();
            } catch (err) {
                window.showToast(err.message);
            }
        });
    }

    window.openAddCaseModalWithData = function(data) {
        addCaseForm.reset();
        
        caseTestType.value = data.testType || "";
        casePriority.value = data.priority || "non-urgent";
        caseDiagnosis.value = data.diagnosis || "";
        caseReport.value = data.report || "";

        addCaseModal.classList.add("active");
        activateTab("section-history");
    };

    updateAuthState();
});

window.getApiBaseUrl = function() {
    if (window.location.port === "8080") {
        return `http://${window.location.hostname}:8000`;
    }
    return window.location.origin;
};

function checkApiStatus() {
    const dot = document.getElementById("api-status-dot");
    const value = document.getElementById("api-status-value");
    const sidebarDot = document.getElementById("sidebar-api-dot");
    const sidebarLabel = document.getElementById("sidebar-api-label");

    fetch(`${window.getApiBaseUrl()}/api/v1/analyze`, { method: "HEAD", signal: AbortSignal.timeout(2500) })
        .then(() => {
            if (dot) { dot.className = "dot dot--green"; }
            if (value) value.textContent = "Operativo (FastAPI)";
            if (sidebarDot) sidebarDot.className = "dot dot--green";
            if (sidebarLabel) sidebarLabel.textContent = "API Backend ✓";
        })
        .catch(() => {
            if (dot) { dot.className = "dot dot--amber"; }
            if (value) value.textContent = "Offline (modo demo)";
            if (sidebarDot) sidebarDot.className = "dot dot--amber";
            if (sidebarLabel) sidebarLabel.textContent = "API Backend (demo)";
        });
}

window.showToast = function(message) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-message");
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3500);
};
