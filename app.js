/**
 * CONTROLADOR PRINCIPAL DE LA APLICACIÓN
 * Maneja la navegación, toggles móviles y la lógica del código QR
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar módulos secundarios
    if (window.TriageModule) window.TriageModule.init();
    if (window.AnalyzerModule) window.AnalyzerModule.init();
    if (window.RiskModule) window.RiskModule.init();

    // 2. Control de Navegación por Pestañas (Tabs)
    const navButtons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".app-section");
    const sidebar = document.querySelector(".sidebar");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            
            // Cambiar clase activa en botones
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Cambiar sección activa
            sections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.id === targetId) {
                    sec.classList.add("active");
                }
            });

            // Cerrar sidebar en móviles tras click
            sidebar.classList.remove("open");
        });
    });

    // 3. Menú Hamburguesa en Móviles
    const menuToggle = document.getElementById("mobile-menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Cerrar sidebar si se hace clic fuera en móvil
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 968) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle && sidebar.classList.contains("open")) {
                sidebar.classList.remove("open");
            }
        }
    });

    // 4. Modal de Código QR
    const qrBtn = document.getElementById("mobile-qr-btn");
    const qrModal = document.getElementById("qr-modal");
    const closeQrModal = document.getElementById("close-qr-modal");
    const qrImage = document.getElementById("qr-image");
    const qrIpAddress = document.getElementById("qr-ip-address");

    // IP local estática detectada en la máquina del usuario
    const LOCAL_IP = "10.206.216.31";
    const PORT = "8080";
    const fallbackServerUrl = `http://${LOCAL_IP}:${PORT}`;

    if (qrBtn && qrModal && closeQrModal) {
        qrBtn.addEventListener("click", () => {
            let targetUrl = window.location.href;

            // Si está abriéndose desde el sistema de archivos local (file://)
            if (window.location.protocol === "file:") {
                targetUrl = fallbackServerUrl;
                qrIpAddress.innerHTML = `${fallbackServerUrl} <br><span style="font-size: 0.75rem; color:#ff9f0a;">⚠️ Abierto desde archivo local. Asegúrate de levantar el servidor http-server.</span>`;
            } else {
                // Si ya está servido por red, usar la URL actual de forma dinámica
                qrIpAddress.innerText = window.location.origin;
                targetUrl = window.location.origin;
            }

            // Generar el código QR usando la API pública qrserver
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;
            qrImage.src = qrApiUrl;

            // Abrir modal
            qrModal.classList.add("active");
        });

        closeQrModal.addEventListener("click", () => {
            qrModal.classList.remove("active");
        });

        // Cerrar al hacer clic en el fondo oscuro
        qrModal.addEventListener("click", (e) => {
            if (e.target === qrModal) {
                qrModal.classList.remove("active");
            }
        });
    }
});
