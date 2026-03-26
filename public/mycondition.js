const conditionInput = document.getElementById("conditionInput");
const generateGuideBtn = document.getElementById("generateGuideBtn");
const bodyInfo = document.getElementById("bodyInfo");
const expectInfo = document.getElementById("expectInfo");
const doctorInfo = document.getElementById("doctorInfo");
const medInfo = document.getElementById("medInfo");

// 1. Генератор на ръководство
generateGuideBtn.addEventListener("click", async () => {
    const condition = conditionInput.value.trim();
    if (!condition) return alert("Моля, въведете състояние.");

    generateGuideBtn.textContent = "MedGuide мисли...";
    generateGuideBtn.disabled = true;

    try {
        const res = await fetch('/api/ai/generate-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ condition })
        });

        if (!res.ok) throw new Error("Сървърна грешка");

        const data = await res.json();
        
        // Попълване на картите с отговорите от AI
        bodyInfo.textContent = data.bodyInfo || "Няма информация.";
        expectInfo.textContent = data.expectInfo || "Няма информация.";
        doctorInfo.textContent = data.doctorInfo || "Няма информация.";
        medInfo.textContent = data.medInfo || "Няма информация.";

    } catch (err) {
        console.error(err);
        alert("Грешка при връзката с AI. Проверете конзолата на сървъра.");
    } finally {
        generateGuideBtn.textContent = "Generate Guide";
        generateGuideBtn.disabled = false;
    }
});

// 2. Chatbot
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    chatInput.value = "";

    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();
        addMessage(data.reply, "bot");
    } catch (err) {
        addMessage("Грешка при свързване с AI чата.", "bot");
    }
});