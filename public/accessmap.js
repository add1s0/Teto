document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("map");
    const placesList = document.getElementById("placesList");
    const filterButtons = document.querySelectorAll(".filter-btn");

    if (!mapElement) {
        console.error("Липсва елемент с id='map' в HTML.");
        return;
    }

    const map = L.map("map").setView([42.6977, 23.3219], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const userIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });

    const placesLayer = L.layerGroup().addTo(map);

    let allPlaces = [];
    let currentFilter = "all";
    let userMarker = null;

    const OVERPASS_ENDPOINTS = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.private.coffee/api/interpreter"
    ];

    function getDistance(lat1, lon1, lat2, lon2) {
        const toRad = deg => deg * Math.PI / 180;
        const R = 6371;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function getPlaceType(place) {
        if (place.tags?.amenity === "pharmacy") return "pharmacy";
        return "hospital";
    }

    function getPlaceTypeLabel(type) {
        if (type === "pharmacy") return "Аптека";
        return "Болница";
    }

    function renderPlaces() {
        placesLayer.clearLayers();
        placesList.innerHTML = "";

        let filteredPlaces = allPlaces;

        if (currentFilter !== "all") {
            filteredPlaces = allPlaces.filter(place => place.type === currentFilter);
        }

        if (filteredPlaces.length === 0) {
            placesList.innerHTML = "<p>Няма намерени места за този филтър.</p>";
            return;
        }

        filteredPlaces.forEach(place => {
            const marker = L.marker([place.lat, place.lon]).addTo(placesLayer);

            marker.bindPopup(`
                <strong>${place.name}</strong><br>
                Тип: ${place.typeLabel}<br>
                Разстояние: ${place.distance.toFixed(2)} км
            `);

            const phone = place.tags?.phone || place.tags?.["contact:phone"] || "";
            const cleanPhone = phone.replace(/\s+/g, "");

            const callButton = phone
                ? `<a href="tel:${cleanPhone}" class="contact-btn call-btn">📞 Обади се</a>`
                : "";

            const card = document.createElement("div");
            card.className = "place-card";

            card.innerHTML = `
                <h3>${place.name}</h3>
                <p><strong>Тип:</strong> ${place.typeLabel}</p>
                <p><strong>Разстояние:</strong> ${place.distance.toFixed(2)} км</p>
                <span class="place-type ${place.type}">${place.typeLabel}</span>
                <div class="contact-buttons">
                    ${callButton}
                </div>
            `;

            card.addEventListener("click", () => {
                map.setView([place.lat, place.lon], 16);
                marker.openPopup();
            });

            placesList.appendChild(card);
        });
    }

    async function fetchFromOverpass(query) {
        let lastError = null;

        for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
                const url = `${endpoint}?data=${encodeURIComponent(query)}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} от ${endpoint}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Грешка от ${endpoint}:`, error);
                lastError = error;
            }
        }

        throw lastError || new Error("Всички Overpass сървъри върнаха грешка.");
    }

    async function loadNearbyPlaces(lat, lon) {
        placesLayer.clearLayers();
        placesList.innerHTML = "<p>Зареждане...</p>";

        const query = `
[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:5000,${lat},${lon});
  way["amenity"="pharmacy"](around:5000,${lat},${lon});
  node["amenity"="hospital"](around:5000,${lat},${lon});
  way["amenity"="hospital"](around:5000,${lat},${lon});
  node["amenity"="clinic"](around:5000,${lat},${lon});
  way["amenity"="clinic"](around:5000,${lat},${lon});
);
out center tags;
        `.trim();

        try {
            const data = await fetchFromOverpass(query);

            if (!data.elements || data.elements.length === 0) {
                placesList.innerHTML = "<p>Няма намерени места.</p>";
                return;
            }

            allPlaces = data.elements
                .map(place => {
                    const latValue = place.lat ?? place.center?.lat;
                    const lonValue = place.lon ?? place.center?.lon;

                    if (!latValue || !lonValue || !place.tags?.amenity) {
                        return null;
                    }

                    const type = getPlaceType(place);

                    return {
                        ...place,
                        lat: latValue,
                        lon: lonValue,
                        name: place.tags.name || "Без име",
                        type,
                        typeLabel: getPlaceTypeLabel(type),
                        distance: getDistance(lat, lon, latValue, lonValue)
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);

            renderPlaces();
        } catch (error) {
            console.error("Крайна грешка при зареждане:", error);
            placesList.innerHTML = `
                <p>Грешка при зареждане.</p>
                <p style="font-size: 0.95rem; margin-top: 0.5rem;">
                    Възможно е сървърът временно да не отговаря.
                </p>
            `;
        }
    }

    function showUserLocation(lat, lon) {
        map.setView([lat, lon], 14);

        if (userMarker) {
            map.removeLayer(userMarker);
        }

        userMarker = L.marker([lat, lon], { icon: userIcon })
            .addTo(map)
            .bindPopup("Вашата локация")
            .openPopup();

        loadNearbyPlaces(lat, lon);
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentFilter = button.dataset.type;
            renderPlaces();
        });
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                showUserLocation(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error("Грешка при взимане на локацията:", error);
                showUserLocation(42.6977, 23.3219);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showUserLocation(42.6977, 23.3219);
    }

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
});