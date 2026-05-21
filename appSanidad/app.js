document.addEventListener("DOMContentLoaded", () => {
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
});

window.getApiBaseUrl = function() {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.endsWith(".loca.lt")) {
        // Dynamic detection for local network IP access
        return `http://${hostname}:8000`;
    }
    return "http://localhost:8000";
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
