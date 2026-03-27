document.addEventListener("DOMContentLoaded", () => {
    const welcomeElement = document.getElementById("welcomeUserText");

    if (!welcomeElement) return;

    const savedUser = localStorage.getItem("medguideUser");

    if (!savedUser) {
        welcomeElement.textContent = "Добър Ден!";
        return;
    }

    try {
        const user = JSON.parse(savedUser);

        if (user.firstName && user.lastName) {
            welcomeElement.textContent = `Добър Ден, ${user.firstName} ${user.lastName}!`;
        } else if (user.firstName) {
            welcomeElement.textContent = `Добър Ден, ${user.firstName}!`;
        } else {
            welcomeElement.textContent = "Добър Ден!";
        }
    } catch (error) {
        console.error("Грешка при четене на потребителя:", error);
        welcomeElement.textContent = "Добър Ден!";
    }
});