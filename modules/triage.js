/**
 * MÓDULO DE TRIAJE INTELIGENTE
 * Analiza los síntomas descritos y clasifica la prioridad del paciente
 */

const TriageModule = {
    // Definición de niveles de prioridad (según Protocolo de Manchester)
    levels: {
        EMERGENCY: {
            name: "Emergencia (Nivel 1)",
            class: "emergency",
            color: "#ff3b30",
            angle: 90, // Derecha extrema
            wait: "Inmediata",
            dept: "Unidad de Cuidados Críticos / Reanimación",
            desc: "Riesgo vital inmediato. Requiere atención médica instantánea sin demora."
        },
        VERY_URGENT: {
            name: "Muy Urgente (Nivel 2)",
            class: "very-urgent",
            color: "#ff9f0a",
            angle: 45,
            wait: "< 10 minutos",
            dept: "Boxes de Urgencias Médicas",
            desc: "Situación de riesgo potencial. Tiempo de respuesta médico crítico."
        },
        URGENT: {
            name: "Urgente (Nivel 3)",
            class: "urgent",
            color: "#ffd60a",
            angle: 0, // Vertical
            wait: "< 60 minutos",
            dept: "Consultas de Especialidades de Urgencia",
            desc: "Paciente estable pero con patología aguda que requiere pruebas y tratamiento rápido."
        },
        LESS_URGENT: {
            name: "Menos Urgente (Nivel 4)",
            class: "less-urgent",
            color: "#30d158",
            angle: -45,
            wait: "< 120 minutos",
            dept: "Consultas de Medicina General / Triaje",
            desc: "Patología subaguda o crónica con afectación leve. Puede esperar turno."
        },
        NON_URGENT: {
            name: "No Urgente (Nivel 5)",
            class: "non-urgent",
            color: "#0a84ff",
            angle: -90, // Izquierda extrema
            wait: "< 240 minutos",
            dept: "Atención Primaria / Consulta Externa",
            desc: "Problema administrativo, revisión o sintomatología leve sin signos de alarma."
        }
    },

    // Historial de mensajes iniciales del bot
    initialMessages: [
        { sender: "bot", text: "¡Hola! Soy el Asistente Clínico de Triaje IA. Escribe los síntomas del paciente de la forma más detallada posible (ej: dolor en el pecho, fiebre alta, dificultad para respirar, dolor de cabeza leve)." }
    ],

    init() {
        this.chatMessages = document.getElementById("chat-messages");
        this.chatInput = document.getElementById("chat-input");
        this.sendBtn = document.getElementById("chat-send-btn");
        this.triageBadge = document.getElementById("triage-badge");
        this.gaugePointer = document.getElementById("gauge-pointer");
        this.triageDetails = document.getElementById("triage-details");

        this.registerEvents();
        this.renderInitialMessages();
    },

    registerEvents() {
        this.sendBtn.addEventListener("click", () => this.handleSendMessage());
        this.chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handleSendMessage();
        });
    },

    renderInitialMessages() {
        this.chatMessages.innerHTML = "";
        this.initialMessages.forEach(msg => this.addMessage(msg.sender, msg.text));
    },

    addMessage(sender, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}`;
        msgDiv.innerText = text;
        this.chatMessages.appendChild(msgDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    handleSendMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        this.addMessage("user", text);
        this.chatInput.value = "";

        // Mostrar indicador de "IA escribiendo..."
        const typingDiv = document.createElement("div");
        typingDiv.className = "message bot typing";
        typingDiv.innerText = "Analizando síntomas...";
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            const evaluation = this.analyzeSymptoms(text);
            this.applyTriageResult(evaluation);
            this.addMessage("bot", `Evaluación completada. Se ha clasificado al paciente como: "${evaluation.priority.name}". ${evaluation.recommendation}`);
        }, 1200);
    },

    // Motor de reglas NLP básico en español para simular la IA de Triaje
    analyzeSymptoms(text) {
        const query = text.toLowerCase();
        
        // Reglas de Emergencia (Nivel 1)
        if (
            (query.includes("pecho") && (query.includes("dolor") || query.includes("presion"))) ||
            query.includes("respirar") && (query.includes("no puedo") || query.includes("asfixia") || query.includes("dificultad grave")) ||
            query.includes("inconsciente") || query.includes("no responde") ||
            query.includes("infarto") ||
            (query.includes("sangrado") && query.includes("abundante")) ||
            query.includes("parada") || query.includes("asfixia")
        ) {
            return {
                priority: this.levels.EMERGENCY,
                recommendation: "Es sumamente crítico trasladar inmediatamente al paciente a la sala de reanimación o llamar a una ambulancia. Mantener al paciente calmado y monitorizar el pulso.",
                precaution: "No suministrar alimentos, bebidas ni medicamentos sin supervisión directa."
            };
        }

        // Reglas de Muy Urgente (Nivel 2)
        if (
            (query.includes("fiebre") && (query.includes("bebe") || query.includes("lactante") || query.includes("40"))) ||
            query.includes("fractura abierta") ||
            (query.includes("dolor") && query.includes("insoportable")) ||
            (query.includes("quemadura") && query.includes("grave")) ||
            (query.includes("debilidad") && query.includes("cara") || query.includes("hablar") || query.includes("ictus") || query.includes("derrame")) ||
            query.includes("intoxicacion") || query.includes("veneno")
        ) {
            return {
                priority: this.levels.VERY_URGENT,
                recommendation: "El paciente debe ser evaluado por personal médico en menos de 10 minutos. Podría tratarse de un cuadro que evolucione rápidamente a grave.",
                precaution: "Evitar la deambulación del paciente y vigilar el nivel de conciencia."
            };
        }

        // Reglas de Urgente (Nivel 3)
        if (
            query.includes("fiebre") && query.includes("alta") ||
            query.includes("asma") || query.includes("dificultad para respirar") ||
            (query.includes("dolor") && (query.includes("moderado") || query.includes("estomago") || query.includes("abdomen"))) ||
            query.includes("corte") && query.includes("sangre") ||
            query.includes("vomito") && query.includes("frecuente") ||
            query.includes("alergia") && query.includes("ronchas")
        ) {
            return {
                priority: this.levels.URGENT,
                recommendation: "Se recomienda valoración en consulta médica de urgencia para realizar pruebas complementarias (analíticas o placas) y controlar el dolor.",
                precaution: "Puedes aplicar compresas frías si hay fiebre moderada o presionar heridas leves para controlar el sangrado."
            };
        }

        // Reglas de Menos Urgente (Nivel 4)
        if (
            query.includes("gripe") || query.includes("resfriado") || 
            query.includes("tos") || query.includes("garganta") ||
            query.includes("esguince") || query.includes("torcedura") ||
            (query.includes("dolor") && query.includes("leve")) ||
            query.includes("diarrea") || query.includes("oido")
        ) {
            return {
                priority: this.levels.LESS_URGENT,
                recommendation: "El paciente presenta un cuadro clínico estable. La atención médica puede demorarse sin riesgo de empeoramiento.",
                precaution: "Mantener una buena hidratación oral. Reposo y paracetamol según pauta estándar de su médico."
            };
        }

        // Por defecto: No Urgente (Nivel 5)
        return {
            priority: this.levels.NON_URGENT,
            recommendation: "Cuadro de carácter leve que no requiere atención en el servicio de urgencias hospitalarias. Puede ser atendido en su centro de salud de atención primaria.",
            precaution: "Solicitar cita programada en su médico de cabecera."
        };
    },

    // Aplica los resultados al panel de triaje e interactúa con el medidor
    applyTriageResult(evaluation) {
        const p = evaluation.priority;
        
        // 1. Actualizar Badge de Estado
        this.triageBadge.className = `triage-badge ${p.class}`;
        this.triageBadge.innerText = p.name;

        // 2. Mover la aguja del medidor
        this.gaugePointer.style.transform = `rotate(${p.angle}deg)`;
        
        // Cambiar sombra/brillo del puntero
        this.gaugePointer.style.boxShadow = `0 0 12px ${p.color}`;

        // 3. Renderizar el reporte detallado
        this.triageDetails.innerHTML = `
            <div class="diagnosis-report">
                <h4>Diagnóstico y Plan de Acción</h4>
                <p><strong>Recomendación:</strong> ${evaluation.recommendation}</p>
                <p><strong>Precauciones:</strong> ${evaluation.precaution}</p>
                
                <div class="report-meta">
                    <div class="meta-item">
                        <strong>Especialidad Destino:</strong>
                        <span>${p.dept}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Tiempo Espera Estimado:</strong>
                        <span style="color: ${p.color}; font-weight: 700;">${p.wait}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Protocolo Clínico:</strong>
                        <span>Manchester v4.2</span>
                    </div>
                </div>
            </div>
        `;
    }
};

window.TriageModule = TriageModule;
