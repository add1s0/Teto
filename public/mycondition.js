const conditionInput = document.getElementById("conditionInput");
const generateGuideBtn = document.getElementById("generateGuideBtn");
const bodyInfo = document.getElementById("bodyInfo");
const expectInfo = document.getElementById("expectInfo");
const doctorInfo = document.getElementById("doctorInfo");
const medInfo = document.getElementById("medInfo");

// 1. Генератор на ръководство
generateGuideBtn.addEventListener("click", async () => {
    const condition = conditionInput.value.trim();
    if (!condition) return alert("Въведете състояние");

    generateGuideBtn.textContent = "Мисли...";
    generateGuideBtn.disabled = true;

    try {
        const res = await fetch('/api/ai/generate-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ condition })
        });
        const data = await res.json();
        
        bodyInfo.textContent = data.bodyInfo;
        expectInfo.textContent = data.expectInfo;
        doctorInfo.textContent = data.doctorInfo;
        medInfo.textContent = data.medInfo;
    } catch (err) {
        alert("Грешка при връзката с AI.");
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
        addMessage("Грешка при чатбота.", "bot");
    }
});