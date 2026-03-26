const events = [
    {
        title: "Витамин D",
        type: "лекарство",
        date: "2026-03-26",
        time: "08:00",
        status: "прието",
        note: "Приет след закуска"
    },
    {
        title: "Лекарство за кръвно налягане",
        type: "лекарство",
        date: "2026-03-26",
        time: "13:00",
        status: "пропуснато",
        note: "Дозата е пропусната"
    },
    {
        title: "Преглед при лекар",
        type: "здраве",
        date: "2026-03-27",
        time: "10:30",
        status: "отложено",
        note: "Пренасрочен за по-късно"
    },
    {
        title: "Антибиотик",
        type: "лекарство",
        date: "2026-03-28",
        time: "09:00",
        status: "прието",
        note: "Приет навреме"
    },
    {
        title: "Обезболяващо",
        type: "лекарство",
        date: "2026-03-29",
        time: "21:00",
        status: "пропуснато",
        note: "Вечерната доза е пропусната"
    },
    {
        title: "Напомняне за прием на вода",
        type: "здраве",
        date: "2026-03-30",
        time: "14:00",
        status: "прието",
        note: "Ежедневна здравна рутина"
    },
    {
        title: "Инхалатор за астма",
        type: "лекарство",
        date: "2026-03-31",
        time: "07:30",
        status: "отложено",
        note: "Приет по-късно от планираното"
    },
    {
        title: "Проверка на кръвната захар",
        type: "здраве",
        date: "2026-04-01",
        time: "08:15",
        status: "прието",
        note: "Сутрешната проверка е приключена"
    }
];

const calendarContainer = document.getElementById("calendarContainer");
const aiWarnings = document.getElementById("aiWarnings");
const currentLabel = document.getElementById("currentLabel");
const viewButtons = document.querySelectorAll(".view-btn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentView = "day";
let currentDate = new Date("2026-03-26");

function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

function formatPrettyDate(date) {
    return date.toLocaleDateString("bg-BG", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getWeekStart(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

function getMonthName(date) {
    return date.toLocaleDateString("bg-BG", {
        month: "long",
        year: "numeric"
    });
}

function getStatusClass(status) {
    if (status === "прието") return "taken";
    if (status === "пропуснато") return "missed";
    if (status === "отложено") return "postponed";
    return "";
}

function getTypeLabel(type) {
    if (type === "лекарство") return "Лекарство";
    if (type === "здраве") return "Здраве";
    return type;
}

function updateLabel() {
    if (currentView === "day") {
        currentLabel.textContent = formatPrettyDate(currentDate);
    } else if (currentView === "week") {
        const start = getWeekStart(currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        currentLabel.textContent = `${start.toLocaleDateString("bg-BG")} - ${end.toLocaleDateString("bg-BG")}`;
    } else {
        currentLabel.textContent = getMonthName(currentDate);
    }
}

function getEventsForDate(dateKey) {
    return events.filter(event => event.date === dateKey);
}

function renderDayView() {
    const dateKey = formatDateKey(currentDate);
    const dayEvents = getEventsForDate(dateKey);

    if (dayEvents.length === 0) {
        calendarContainer.innerHTML = `
            <div class="day-view">
                <div class="day-card">
                    <h3>Няма събития за този ден</h3>
                    <p>Нямате планирани лекарства или здравни напомняния.</p>
                </div>
            </div>
        `;
        return;
    }

    calendarContainer.innerHTML = `
        <div class="day-view">
            ${dayEvents.map(event => `
                <div class="day-card ${getStatusClass(event.status)}">
                    <div class="day-card-header">
                        <div>
                            <h3>${event.title}</h3>
                            <p><strong>Тип:</strong> ${getTypeLabel(event.type)}</p>
                            <p><strong>Час:</strong> ${event.time}</p>
                        </div>
                        <span class="status-badge ${getStatusClass(event.status)}">
                            ${capitalize(event.status)}
                        </span>
                    </div>
                    <p>${event.note}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function renderWeekView() {
    const start = getWeekStart(currentDate);
    let html = `<div class="week-grid">`;

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const dateKey = formatDateKey(day);
        const dayEvents = getEventsForDate(dateKey);

        html += `
            <div class="week-day">
                <h3>${day.toLocaleDateString("bg-BG", { weekday: "short", day: "numeric", month: "short" })}</h3>
                ${dayEvents.length
                    ? dayEvents.map(event => `
                        <div class="week-event ${getStatusClass(event.status)}">
                            ${event.time} • ${event.title}
                        </div>
                    `).join("")
                    : `<p>Няма събития</p>`
                }
            </div>
        `;
    }

    html += `</div>`;
    calendarContainer.innerHTML = html;
}

function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ["Пон", "Вт", "Ср", "Чет", "Пет", "Съб", "Нед"];

    let html = `<div class="month-grid">`;

    dayNames.forEach(day => {
        html += `<div class="month-day-name">${day}</div>`;
    });

    for (let i = 0; i < startDay; i++) {
        html += `<div class="month-cell empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const dateKey = formatDateKey(cellDate);
        const dayEvents = getEventsForDate(dateKey);

        html += `
            <div class="month-cell">
                <div class="month-date">${day}</div>
                ${dayEvents.map(event => `
                    <div 
                        class="month-dot ${getStatusClass(event.status)}" 
                        title="${event.title} - ${capitalize(event.status)}"
                    ></div>
                `).join("")}
            </div>
        `;
    }

    html += `</div>`;
    calendarContainer.innerHTML = html;
}

function generateAIWarnings() {
    const missedEvents = events.filter(event => event.status === "пропуснато");
    const postponedEvents = events.filter(event => event.status === "отложено");

    let warnings = [];

    if (missedEvents.length > 0) {
        warnings.push(`
            <div class="ai-card risk">
                <h3>Предупреждение за пропусната доза</h3>
                <p>Имате ${missedEvents.length} пропуснати лекарствени или здравни събития. Повтарящите се пропуски могат да намалят ефективността на лечението.</p>
            </div>
        `);
    }

    if (postponedEvents.length > 0) {
        warnings.push(`
            <div class="ai-card">
                <h3>Напомняне за отложено събитие</h3>
                <p>Имате ${postponedEvents.length} отложени напомняния. Опитайте да ги пренасрочите възможно най-скоро, за да не нарушите здравната си рутина.</p>
            </div>
        `);
    }

    if (missedEvents.length === 0 && postponedEvents.length === 0) {
        warnings.push(`
            <div class="ai-card safe">
                <h3>Чудесна работа</h3>
                <p>Всички планирани лекарства и здравни събития изглеждат изпълнени по график.</p>
            </div>
        `);
    }

    aiWarnings.innerHTML = warnings.join("");
}

function renderCalendar() {
    updateLabel();

    if (currentView === "day") {
        renderDayView();
    } else if (currentView === "week") {
        renderWeekView();
    } else {
        renderMonthView();
    }

    generateAIWarnings();
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

viewButtons.forEach(button => {
    button.addEventListener("click", () => {
        viewButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        currentView = button.dataset.view;
        renderCalendar();
    });
});

prevBtn.addEventListener("click", () => {
    if (currentView === "day") {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (currentView === "week") {
        currentDate.setDate(currentDate.getDate() - 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
    }

    currentDate = new Date(currentDate);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    if (currentView === "day") {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if (currentView === "week") {
        currentDate.setDate(currentDate.getDate() + 7);
    } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    currentDate = new Date(currentDate);
    renderCalendar();
});

renderCalendar();