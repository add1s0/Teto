const events = [
    {
        title: "Vitamin D",
        type: "medicine",
        date: "2026-03-26",
        time: "08:00",
        status: "taken",
        note: "Taken after breakfast"
    },
    {
        title: "Blood Pressure Medicine",
        type: "medicine",
        date: "2026-03-26",
        time: "13:00",
        status: "missed",
        note: "Dose was missed"
    },
    {
        title: "Doctor Appointment",
        type: "health",
        date: "2026-03-27",
        time: "10:30",
        status: "postponed",
        note: "Rescheduled for later"
    },
    {
        title: "Antibiotic",
        type: "medicine",
        date: "2026-03-28",
        time: "09:00",
        status: "taken",
        note: "Taken on time"
    },
    {
        title: "Pain Relief",
        type: "medicine",
        date: "2026-03-29",
        time: "21:00",
        status: "missed",
        note: "Evening dose missed"
    },
    {
        title: "Hydration Reminder",
        type: "health",
        date: "2026-03-30",
        time: "14:00",
        status: "taken",
        note: "Daily health routine"
    },
    {
        title: "Asthma Inhaler",
        type: "medicine",
        date: "2026-03-31",
        time: "07:30",
        status: "postponed",
        note: "Taken later than planned"
    },
    {
        title: "Check Blood Sugar",
        type: "health",
        date: "2026-04-01",
        time: "08:15",
        status: "taken",
        note: "Morning check completed"
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
    return date.toLocaleDateString("en-GB", {
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
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function updateLabel() {
    if (currentView === "day") {
        currentLabel.textContent = formatPrettyDate(currentDate);
    } else if (currentView === "week") {
        const start = getWeekStart(currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        currentLabel.textContent = `${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`;
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
                    <h3>No events for this day</h3>
                    <p>You have no medicines or health reminders scheduled.</p>
                </div>
            </div>
        `;
        return;
    }

    calendarContainer.innerHTML = `
        <div class="day-view">
            ${dayEvents.map(event => `
                <div class="day-card ${event.status}">
                    <div class="day-card-header">
                        <div>
                            <h3>${event.title}</h3>
                            <p><strong>Time:</strong> ${event.time}</p>
                        </div>
                        <span class="status-badge ${event.status}">
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
                <h3>${day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</h3>
                ${dayEvents.length
                    ? dayEvents.map(event => `
                        <div class="week-event ${event.status}">
                            ${event.time} • ${event.title}
                        </div>
                    `).join("")
                    : `<p>No events</p>`
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

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
                    <div class="month-dot ${event.status}" title="${event.title} - ${event.status}"></div>
                `).join("")}
            </div>
        `;
    }

    html += `</div>`;
    calendarContainer.innerHTML = html;
}

function generateAIWarnings() {
    const missedEvents = events.filter(event => event.status === "missed");
    const postponedEvents = events.filter(event => event.status === "postponed");

    let warnings = [];

    if (missedEvents.length > 0) {
        warnings.push(`
            <div class="ai-card risk">
                <h3>Missed dose warning</h3>
                <p>You have ${missedEvents.length} missed medication or health events. Repeated missed doses may reduce treatment effectiveness.</p>
            </div>
        `);
    }

    if (postponedEvents.length > 0) {
        warnings.push(`
            <div class="ai-card">
                <h3>Postponed event reminder</h3>
                <p>You have ${postponedEvents.length} postponed reminders. Try to reschedule them as soon as possible to avoid disruption in your care routine.</p>
            </div>
        `);
    }

    if (missedEvents.length === 0 && postponedEvents.length === 0) {
        warnings.push(`
            <div class="ai-card safe">
                <h3>Great job</h3>
                <p>All scheduled medicines and health events appear to be on track.</p>
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