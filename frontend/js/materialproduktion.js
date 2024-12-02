import { apiFetch } from './api.js';

// Materialproduzierende Gebäudekosten laden und anzeigen
async function loadBuildingCosts() {
    try {
        const buildingCosts = await apiFetch('/api/buildings/material', 'GET'); // API für Materialproduktion
        console.log('Material-producing building costs:', buildingCosts);

        const buildingCostsContainer = document.getElementById('building-costs');
        if (!buildingCostsContainer) {
            console.error("Element mit ID 'building-costs' nicht gefunden.");
            return;
        }
        buildingCostsContainer.innerHTML = ''; // Vorherigen Inhalt löschen

        const resourcesResponse = await apiFetch('/api/resources', 'GET'); // Hole aktuelle Ressourcen des Benutzers
        const resources = resourcesResponse.reduce((acc, resource) => {
            acc[resource.name] = parseFloat(resource.amount);
            return acc;
        }, {});

        // Gebäude durchlaufen
        buildingCosts.forEach(building => {
            // Gebäude-Container erstellen
            const buildingDiv = document.createElement('div');
            buildingDiv.className = 'building-card';

            // Gebäudebild hinzufügen
            if (building.image) {
                const imageElement = document.createElement('img');
                imageElement.src = building.image;
                imageElement.alt = building.name;
                imageElement.className = 'building-image';
                buildingDiv.appendChild(imageElement);
            }

            // Gebäudename hinzufügen
            const nameElement = document.createElement('h3');
            nameElement.textContent = building.name;
            buildingDiv.appendChild(nameElement);

            // Maximale Anzahl berechnen
            const maxBuildable = calculateMaxBuildable(building.cost, resources);

            // Maximale Anzahl anzeigen
            const maxElement = document.createElement('p');
            maxElement.textContent = `Maximal baubar: ${maxBuildable}`;
            buildingDiv.appendChild(maxElement);

            // Kosten anzeigen
            const costList = document.createElement('ul');
            Object.entries(building.cost).forEach(([resource, cost]) => {
                const costItem = document.createElement('li');
                costItem.textContent = `${resource}: ${cost}`;
                costList.appendChild(costItem);
            });
            buildingDiv.appendChild(costList);

            // Eingabefeld für die Anzahl
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.placeholder = 'Anzahl';
            input.id = `build-amount-${building.id}`;
            buildingDiv.appendChild(input);

            // Maximal bauen Button
            const maxButton = document.createElement('button');
            maxButton.textContent = 'Maximale Anzahl übernehmen';
            maxButton.addEventListener('click', () => {
                input.value = maxBuildable; // Setze den maximalen Wert ins Eingabefeld
            });
            buildingDiv.appendChild(maxButton);

            // Bau-Button
            const buildButton = document.createElement('button');
            buildButton.textContent = 'Bauen';
            buildButton.className = 'build-button';
            buildButton.addEventListener('click', () => handleBuildButton(building.id, input));
            buildingDiv.appendChild(buildButton);

            // Gebäude-Container zum Hauptcontainer hinzufügen
            buildingCostsContainer.appendChild(buildingDiv);
        });
    } catch (error) {
        console.error('Error loading building costs:', error.message);
        alert('Fehler beim Laden der Gebäudekosten.');
    }
}

// Maximale Anzahl berechnen
function calculateMaxBuildable(costs, resources) {
    return Math.min(
        ...Object.entries(costs).map(([resource, cost]) => {
            const available = resources[resource] || 0;
            return Math.floor(available / cost);
        })
    );
}

// Gebäude bauen
async function buildBuilding(buildingId, amount) {
    try {
        console.log(`Building ${amount} units of building ID ${buildingId}...`);
        const response = await apiFetch('/api/buildings/build', 'POST', { buildingId, amount });
        alert(`Erfolgreich ${amount} Gebäude gebaut!`);
        console.log('Build response:', response);
        await loadBuildingCosts(); // Aktualisiert die Gebäudeliste nach dem Bau
    } catch (error) {
        console.error('Error building:', error.message);
        alert('Fehler beim Bauen: ' + error.message);
    }
}

// Handler für den Bau-Button
function handleBuildButton(buildingId, input) {
    const amount = parseInt(input.value, 10);
    if (isNaN(amount) || amount <= 0) {
        alert('Bitte geben Sie eine gültige Anzahl ein.');
        console.warn(`Invalid amount entered for building ID ${buildingId}:`, input.value);
        return;
    }
    console.log(`Building ID ${buildingId} with amount ${amount}`);
    buildBuilding(buildingId, amount);
}

// Inhalte beim Laden der Seite initialisieren
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing loadBuildingCosts...');
    loadBuildingCosts();
});
