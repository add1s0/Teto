document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([42.6977, 23.3219], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const placesList = document.getElementById("placesList");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let markers = [];
    let userMarker = null;
    let accuracyCircle = null;
    let userLocation = null;
    let allPlaces = [];
    let watchId = null;

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

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

    function formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)} м`;
        }
        return `${distance.toFixed(2)} км`;
    }

    function getActiveFilter() {
        const activeBtn = document.querySelector(".filter-btn.active");
        return activeBtn ? activeBtn.dataset.type : "all";
    }

    function clearMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getAddress(tags = {}) {
        const parts = [
            tags["addr:street"],
            tags["addr:housenumber"],
            tags["addr:city"]
        ].filter(Boolean);

        if (parts.length) {
            return parts.join(", ");
        }

        return "Няма посочен адрес";
    }

    function getPhone(tags = {}) {
        return tags.phone || tags["contact:phone"] || "Няма телефон";
    }

    function getEmail(tags = {}) {
        return tags.email || tags["contact:email"] || "Няма email";
    }

    function getDescription(place) {
        if (place.type === "hospital") {
            return "Болница или медицинско заведение в близост до вашата локация.";
        }
        return "Аптека в близост до вашата локация.";
    }

    function extractCoordinates(element) {
        if (element.lat && element.lon) {
            return {
                lat: element.lat,
                lng: element.lon
            };
        }

        if (element.center && element.center.lat && element.center.lon) {
            return {
                lat: element.center.lat,
                lng: element.center.lon
            };
        }

        return null;
    }

    function normalizeOverpassData(elements) {
        return elements
            .map(element => {
                const coords = extractCoordinates(element);
                if (!coords) return null;

                const tags = element.tags || {};
                const amenity = tags.amenity;

                let type = null;
                if (amenity === "hospital") type = "hospital";
                if (amenity === "pharmacy") type = "pharmacy";
                if (!type) return null;

                const name =
                    tags.name ||
                    (type === "hospital" ? "Болница" : "Аптека");

                return {
                    id: `${element.type}-${element.id}`,
                    name,
                    type,
                    description: getDescription({ type }),
                    address: getAddress(tags),
                    phone: getPhone(tags),
                    email: getEmail(tags),
                    lat: coords.lat,
                    lng: coords.lng,
                    tags
                };
            })
            .filter(Boolean);
    }

    async function fetchNearbyPlaces(lat, lng, radius = 3000) {
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:${radius},${lat},${lng});
              way["amenity"="hospital"](around:${radius},${lat},${lng});
              relation["amenity"="hospital"](around:${radius},${lat},${lng});

              node["amenity"="pharmacy"](around:${radius},${lat},${lng});
              way["amenity"="pharmacy"](around:${radius},${lat},${lng});
              relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
            );
            out center tags;
        `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query.trim()
        });

        if (!response.ok) {
            throw new Error("Грешка при заявка към Overpass API");
        }

        const data = await response.json();
        return normalizeOverpassData(data.elements || []);
    }

    function renderPlaces(type = "all") {
        if (!placesList) return;

        placesList.innerHTML = "";
        clearMarkers();

        let filteredPlaces =
            type === "all"
                ? [...allPlaces]
                : allPlaces.filter(place => place.type === type);

        if (userLocation) {
            filteredPlaces = filteredPlaces.map(place => ({
                ...place,
                distance: getDistanceFromLatLonInKm(
                    userLocation.lat,
                    userLocation.lng,
                    place.lat,
                    place.lng
                )
            }));

            filteredPlaces.sort((a, b) => a.distance - b.distance);
        }

        if (filteredPlaces.length === 0) {
            placesList.innerHTML = `<p>Няма намерени места наблизо.</p>`;
            return;
        }

        const bounds = [];

        if (userLocation) {
            bounds.push([userLocation.lat, userLocation.lng]);
        }

        filteredPlaces.forEach(place => {
            const safeName = escapeHtml(place.name);
            const safeDescription = escapeHtml(place.description);
            const safeAddress = escapeHtml(place.address);
            const safePhone = escapeHtml(place.phone);
            const safeEmail = escapeHtml(place.email);

            const phoneHtml =
                place.phone !== "Няма телефон"
                    ? `<a href="tel:${place.phone}">${safePhone}</a>`
                    : safePhone;

            const emailHtml =
                place.email !== "Няма email"
                    ? `<a href="mailto:${place.email}">${safeEmail}</a>`
                    : safeEmail;

            const popupContent = `
                <div class="popup-box">
                    <b>${safeName}</b><br>
                    ${safeDescription}<br><br>
                    <strong>Адрес:</strong> ${safeAddress}<br>
                    <strong>Тел:</strong> ${phoneHtml}<br>
                    <strong>Email:</strong> ${emailHtml}<br>
                    ${
                        place.distance !== undefined
                            ? `<strong>Разстояние:</strong> ${formatDistance(place.distance)}`
                            : ""
                    }
                </div>
            `;

            const marker = L.marker([place.lat, place.lng])
                .addTo(map)
                .bindPopup(popupContent);

            markers.push(marker);
            bounds.push([place.lat, place.lng]);

            const card = document.createElement("div");
            card.classList.add("place-card");

            card.innerHTML = `
                <h3>${safeName}</h3>
                <p>${safeDescription}</p>
                <p><strong>Адрес:</strong> ${safeAddress}</p>
                <p><strong>Телефон:</strong> ${phoneHtml}</p>
                <p><strong>Email:</strong> ${emailHtml}</p>
                ${
                    place.distance !== undefined
                        ? `<p><strong>Разстояние:</strong> ${formatDistance(place.distance)}</p>`
                        : ""
                }

                <div class="contact-buttons">
                    ${
                        place.phone !== "Няма телефон"
                            ? `<a href="tel:${place.phone}" class="contact-btn call-btn">Обади се</a>`
                            : ""
                    }
                    ${
                        place.email !== "Няма email"
                            ? `<a href="mailto:${place.email}" class="contact-btn email-btn">Email</a>`
                            : ""
                    }
                </div>

                <span class="place-type ${place.type}">
                    ${place.type === "hospital" ? "Болница" : "Аптека"}
                </span>
            `;

            card.addEventListener("click", () => {
                map.setView([place.lat, place.lng], 17);
                marker.openPopup();
            });

            placesList.appendChild(card);
        });

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    async function loadNearbyPlaces() {
        if (!userLocation) return;

        try {
            placesList.innerHTML = "<p>Зареждане на най-близките аптеки и болници...</p>";

            const places = await fetchNearbyPlaces(
                userLocation.lat,
                userLocation.lng,
                3000
            );

            allPlaces = places;
            renderPlaces(getActiveFilter());
        } catch (error) {
            console.error("Грешка при зареждане на местата:", error);
            placesList.innerHTML =
                "<p>Не успяхме да заредим близките места. Опитай отново след малко.</p>";
        }
    }

    function setUserLocation(lat, lng, accuracy = null) {
        userLocation = { lat, lng };

        if (userMarker) {
            map.removeLayer(userMarker);
        }

        if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
        }

        userMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
                accuracy
                    ? `Вашата локация<br>Точност: ${Math.round(accuracy)} м`
                    : "Вашата локация"
            )
            .openPopup();

        if (accuracy) {
            accuracyCircle = L.circle([lat, lng], {
                radius: accuracy,
                color: "#124170",
                fillColor: "#67C090",
                fillOpacity: 0.15
            }).addTo(map);
        }

        map.setView([lat, lng], 15);
    }

    function getUserLocation() {
        if (!navigator.geolocation) {
            alert("Браузърът не поддържа геолокация.");
            placesList.innerHTML = "<p>Геолокацията не се поддържа от браузъра.</p>";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude, accuracy } = position.coords;

                console.log("Локация:", latitude, longitude, "Точност:", accuracy);

                setUserLocation(latitude, longitude, accuracy);
                await loadNearbyPlaces();

                if (accuracy > 300) {
                    alert("Локацията е взета, но не е много точна. Ако си на телефон, включи GPS / точна локация.");
                }
            },
            error => {
                console.error("Location error:", error);
                alert("Не успяхме да вземем локацията ти. Разреши достъп до location и опитай пак.");
                placesList.innerHTML = "<p>Локацията не е разрешена или не е налична.</p>";
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );

        watchId = navigator.geolocation.watchPosition(
            position => {
                const { latitude, longitude, accuracy } = position.coords;

                setUserLocation(latitude, longitude, accuracy);
            },
            error => {
                console.warn("watchPosition error:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000
            }
        );
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            renderPlaces(button.dataset.type);
        });
    });

    getUserLocation();

    window.addEventListener("beforeunload", () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    });
});