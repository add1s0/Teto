const conditionInput = document.getElementById("conditionInput");
const generateGuideBtn = document.getElementById("generateGuideBtn");

const bodyInfo = document.getElementById("bodyInfo");
const expectInfo = document.getElementById("expectInfo");
const doctorInfo = document.getElementById("doctorInfo");
const medInfo = document.getElementById("medInfo");

generateGuideBtn.addEventListener("click", () => {
    const condition = conditionInput.value;

    if (!condition) return alert("Въведи състояние");

    bodyInfo.textContent = `При ${condition} тялото функционира по различен начин.`;
    expectInfo.textContent = `При ${condition} може да има различни симптоми.`;
    doctorInfo.textContent = `Попитай лекаря си за ${condition}.`;
    medInfo.textContent = `Лекарствата са важни при ${condition}.`;
});

/* CHAT */
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");

function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = text;
    chatMessages.appendChild(div);
}

sendBtn.addEventListener("click", () => {
    const text = chatInput.value;
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    setTimeout(() => {
        addMessage("AI отговор (demo)", "bot");
    }, 500);
});