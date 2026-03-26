const places = [
    {
        name: "City Hospital",
        type: "hospital",
        description: "Голяма многопрофилна болница с 24/7 спешно отделение.",
        address: "бул. Витоша 25, София",
        phone: "+35921234567",
        email: "contact@cityhospital.bg",
        lat: 42.6977,
        lng: 23.3219
    },
    {
        name: "Green Pharmacy",
        type: "pharmacy",
        description: "Аптека с лекарства, консултации и бързо обслужване.",
        address: "ул. Алабин 14, София",
        phone: "+35922345678",
        email: "info@greenpharmacy.bg",
        lat: 42.6992,
        lng: 23.3255
    },
    {
        name: "Central Medical Center",
        type: "hospital",
        description: "Медицински център с лаборатория и специалисти.",
        address: "бул. България 102, София",
        phone: "+35923456789",
        email: "office@centralmedical.bg",
        lat: 42.6945,
        lng: 23.3180
    },
    {
        name: "HealthPlus Pharmacy",
        type: "pharmacy",
        description: "Аптека с денонощен достъп и здравни продукти.",
        address: "ул. Граф Игнатиев 33, София",
        phone: "+35924567890",
        email: "support@healthplus.bg",
        lat: 42.7010,
        lng: 23.3172
    }
];

const map = L.map("map").setView([42.6977, 23.3219], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];
let userMarker = null;
let userLocation = null;

/* Разстояние между две точки в km */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getActiveFilter() {
    const activeBtn = document.querySelector(".filter-btn.active");
    return activeBtn ? activeBtn.getAttribute("data-type") : "all";
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function renderPlaces(type = "all") {
    const placesList = document.getElementById("placesList");
    placesList.innerHTML = "";

    clearMarkers();

    let filteredPlaces =
        type === "all"
            ? [...places]
            : places.filter(place => place.type === type);

    if (userLocation) {
        filteredPlaces = filteredPlaces.map(place => {
            const distance = getDistanceFromLatLonInKm(
                userLocation.lat,
                userLocation.lng,
                place.lat,
                place.lng
            );

            return { ...place, distance };
        });

        filteredPlaces.sort((a, b) => a.distance - b.distance);
    }

    filteredPlaces.forEach(place => {
        const popupContent = `
            <div class="popup-box">
                <b>${place.name}</b><br>
                ${place.description}<br><br>
                <strong>Адрес:</strong> ${place.address}<br>
                <strong>Тел:</strong> <a href="tel:${place.phone}">${place.phone}</a><br>
                <strong>Email:</strong> <a href="mailto:${place.email}">${place.email}</a><br>
                ${place.distance ? `<strong>Разстояние:</strong> ${place.distance.toFixed(2)} km` : ""}
            </div>
        `;

        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(popupContent);

        markers.push(marker);

        const card = document.createElement("div");
        card.classList.add("place-card");

        card.innerHTML = `
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p><strong>Адрес:</strong> ${place.address}</p>
            <p><strong>Телефон:</strong> <a href="tel:${place.phone}">${place.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${place.email}">${place.email}</a></p>
            ${place.distance ? `<p><strong>Разстояние:</strong> ${place.distance.toFixed(2)} km</p>` : ""}

            <div class="contact-buttons">
                <a href="tel:${place.phone}" class="contact-btn call-btn">Call</a>
                <a href="mailto:${place.email}" class="contact-btn email-btn">Email</a>
            </div>

            <span class="place-type ${place.type}">
                ${place.type === "hospital" ? "Болница" : "Аптека"}
            </span>
        `;

        placesList.appendChild(card);
    });
}

function getUserLocation() {
    if (!navigator.geolocation) {
        alert("Браузърът не поддържа геолокация.");
        renderPlaces();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([userLocation.lat, userLocation.lng])
                .addTo(map)
                .bindPopup("Your location")
                .openPopup();

            map.setView([userLocation.lat, userLocation.lng], 14);

            renderPlaces(getActiveFilter());
        },
        (error) => {
            console.log("Location error:", error);
            alert("Не успяхме да вземем локацията ти. Показваме стандартната карта.");
            renderPlaces();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const type = button.getAttribute("data-type");
        renderPlaces(type);
    });
});

getUserLocation();