const cleanText = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const containsAny = (str, words) => words.some(word => str.includes(word));
const containsAll = (str, wordGroups) => wordGroups.every(group => containsAny(str, group));

const TriageModule = {
    levels: {
        EMERGENCY: {
            name: "Emergencia (Nivel 1)",
            class: "emergency",
            color: "#ff3b30",
            angle: 90,
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
            angle: 0,
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
            angle: -90,
            wait: "< 240 minutos",
            dept: "Atención Primaria / Consulta Externa",
            desc: "Problema administrativo, revisión o sintomatología leve sin signos de alarma."
        }
    },

    rules: [
        {
            level: "EMERGENCY",
            recommendation: "Es sumamente crítico trasladar inmediatamente al paciente a la sala de reanimación o llamar a una ambulancia. Mantener al paciente calmado y monitorizar el pulso.",
            precaution: "No suministrar alimentos, bebidas ni medicamentos sin supervisión directa. DISCLAIMER: La IA no reemplaza al diagnóstico médico.",
            match(q) {
                return (
                    containsAll(q, [["pecho", "toracic", "corazon", "esternal", "precordial"], ["dolor", "duele", "presion", "opresion", "ahogo", "punzada", "fuerte", "agudo", "aprieta", "molestia", "molesta"]]) ||
                    containsAny(q, ["asfixi", "atragant", "ahog"]) ||
                    containsAll(q, [["respirar", "respiracion", "aire", "disnea"], ["no puedo", "falta", "dificultad grave", "grave", "insuficiente", "cuesta mucho"]]) ||
                    containsAny(q, ["inconsciente", "desmayo", "desvanecido", "no responde", "sin respuesta", "perdida de conocimiento", "desmayado", "comatoso"]) ||
                    containsAny(q, ["infarto", "parada", "paro", "paro cardiaco", "ataque al corazon", "parada cardiaca"]) ||
                    containsAll(q, [["sangrado", "hemorragia", "sangre"], ["abundante", "profuso", "mucha", "no para", "chorro", "masiva"]]) ||
                    containsAny(q, ["shock", "convulsion", "convulsiones"])
                );
            }
        },
        {
            level: "VERY_URGENT",
            recommendation: "El paciente requiere valoración médica prioritaria. Los signos de trombocitopenia (petequias, plaquetas muy bajas) o sangrados espontáneos conllevan riesgo hemorrágico alto.",
            precaution: "Evitar golpes, reposo absoluto, no consumir aspirina ni AINEs. DISCLAIMER: La IA no es un diagnóstico médico profesional.",
            match(q) {
                return (
                    containsAll(q, [["fiebre", "temperatura", "calentura"], ["bebe", "lactante", "neonato", "recien nacido", "crio", "nene"]]) ||
                    (containsAny(q, ["fiebre", "temperatura", "calentura"]) && (q.includes("40") || q.includes("41") || q.includes("39.5") || q.includes("39,5"))) ||
                    containsAny(q, ["fractura abierta", "hueso expuesto", "hueso fuera", "hueso roto expuesto"]) ||
                    containsAll(q, [["dolor", "duele"], ["insoportable", "muy fuerte", "extremo", "intenso", "agudo", "terrible", "horroroso"]]) ||
                    containsAll(q, [["quemadura", "quemado"], ["grave", "tercer grado", "segundo grado", "extensa", "ampollas grandes"]]) ||
                    containsAny(q, ["ictus", "derrame cerebral", "embolia", "paralisis", "hemiplejia"]) ||
                    (containsAny(q, ["debilidad", "adormecido", "paralizado", "torcido"]) && containsAny(q, ["cara", "rostro", "brazo", "pierna", "lado", "mitad cuerpo"])) ||
                    containsAny(q, ["dificultad para hablar", "no puede hablar", "habla rara", "hablar mal"]) ||
                    containsAny(q, ["intoxicacion", "veneno", "sobredosis", "envenenado", "envenenamiento", "ingerido quimico"]) ||
                    containsAny(q, ["trombocitopenia", "plaquetas bajas", "petequias", "hematomas sin", "sangrado encia", "sangrado de encia", "sangrado de encias"])
                );
            }
        },
        {
            level: "URGENT",
            recommendation: "Se recomienda valoración en consulta médica de urgencia para realizar pruebas complementarias (analíticas o placas) y controlar el dolor.",
            precaution: "Puedes aplicar compresas frías si hay fiebre moderada o presionar heridas leves. DISCLAIMER: La IA no reemplaza al médico.",
            match(q) {
                return (
                    containsAll(q, [["fiebre", "temperatura", "calentura"], ["alta", "39", "38.5", "38,5"]]) ||
                    containsAny(q, ["asma", "sibilancias", "pitos", "broncoespasmo", "dificultad para respirar", "dificultad respirar", "falta de aire", "falta el aire"]) ||
                    containsAll(q, [["dolor", "duele"], ["moderado", "fuerte", "estomago", "abdomen", "tripa", "barriga", "renal", "riñon", "vesicula"]]) ||
                    containsAll(q, [["corte", "herida"], ["sangre", "sangra", "profundo", "puntos"]]) ||
                    containsAny(q, ["vomito", "vomitos", "vomitando", "nauseas", "nausea", "no retiene"]) ||
                    containsAll(q, [["alergia", "alergico", "reaccion"], ["ronchas", "urticaria", "hinchazon", "picores"]])
                );
            }
        },
        {
            level: "LESS_URGENT",
            recommendation: "El paciente presenta un cuadro clínico estable. La atención médica puede demorarse sin riesgo de empeoramiento.",
            precaution: "Mantener una buena hidratación oral. Reposo y paracetamol según pauta estándar de su médico. DISCLAIMER: La IA no reemplaza al médico.",
            match(q) {
                return (
                    containsAny(q, ["gripe", "resfriado", "catarro", "resfrio", "tos", "garganta", "dolor de garganta", "mocos", "congestion"]) ||
                    containsAny(q, ["esguince", "torcedura", "luxacion", "golpe leve", "contusion"]) ||
                    containsAll(q, [["dolor", "duele"], ["leve", "suave", "poco"]]) ||
                    containsAny(q, ["diarrea", "gastroenteritis", "suelta", "estomago descompuesto"]) ||
                    containsAny(q, ["oido", "dolor de oido", "otitis"]) ||
                    containsAny(q, ["fiebre", "temperatura", "febricula", "calentura"])
                );
            }
        }
    ],

    initialMessages: [
        { sender: "bot", text: "¡Hola! Soy el Asistente Clínico de Triaje IA. Escribe los síntomas del paciente de la forma más detallada posible (ej: dolor en el pecho, fiebre alta, dificultad para respirar, hematomas sin causa, petequias)." }
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

    analyzeSymptoms(text) {
        const q = cleanText(text);
        const matched = this.rules.find(rule => rule.match(q));

        if (matched) {
            return {
                priority: this.levels[matched.level],
                recommendation: matched.recommendation,
                precaution: matched.precaution
            };
        }

        return {
            priority: this.levels.NON_URGENT,
            recommendation: "Cuadro de carácter leve que no requiere atención en el servicio de urgencias hospitalarias. Puede ser atendido en su centro de salud de atención primaria.",
            precaution: "Solicitar cita programada en su médico de cabecera. DISCLAIMER: La IA no es un diagnóstico profesional."
        };
    },

    applyTriageResult(evaluation) {
        const p = evaluation.priority;

        this.triageBadge.className = `triage-badge ${p.class}`;
        this.triageBadge.innerText = p.name;

        this.gaugePointer.style.transform = `rotate(${p.angle}deg)`;
        this.gaugePointer.style.boxShadow = `0 0 12px ${p.color}`;

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
