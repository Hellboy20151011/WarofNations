document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sie sind nicht angemeldet!');
        window.location.href = '/index.html'; // Zur Login-Seite weiterleiten
        return;
    }

    try {
        console.log('Abrufen der Dashboard-Daten...');
        const response = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('API Antwortstatus:', response.status);

        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Dashboard-Daten');
        }

        const data = await response.json();
        console.log('Dashboard-Daten:', JSON.stringify(data, null, 2)); // Antwortdaten prüfen

        updateResources(data.resources);
        updateBuildings(data.buildings);
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
    }
});

// Feste Reihenfolge der Ressourcen
const resourceOrder = ['Geld', 'Stein', 'Metall', 'Treibstoff', 'Strom']; // Beispiel für die Reihenfolge

// Ressourcen im Status-Bereich anzeigen
function updateResources(resources) {
    console.log('Update Resources aufgerufen mit:', resources);
    const statusBar = document.querySelector('.status-bar');
    statusBar.innerHTML = '<span>Daten werden geladen...</span>';

    if (!statusBar) {
        console.error('Status-Bar-Element nicht gefunden!');
        return;
    }

    // Ressourcen sortieren nach fester Reihenfolge
    const sortedResources = resourceOrder.map(name => {
        return resources.find(r => r.name === name) || { name, amount: 0 }; // Fallback für fehlende Ressourcen
    });

    if (sortedResources.length === 0) {
        statusBar.innerHTML = '<span>Keine Ressourcen verfügbar</span>';
    } else {
        statusBar.innerHTML = sortedResources
            .map(r => `<span>${r.name}: ${r.amount}</span>`)
            .join(' | ');
    }
}

// Gebäude im Hauptbereich anzeigen
function updateBuildings(buildings) {
    console.log('Update Buildings aufgerufen mit:', buildings);
    const buildingsList = document.getElementById('buildings-list');
    if (!buildingsList) {
        console.error('Buildings-List-Element nicht gefunden!');
        return;
    }

    if (buildings.length === 0) {
        buildingsList.innerHTML = '<p>- Noch keine Gebäude gebaut -</p>';
    } else {
        buildingsList.innerHTML = buildings.map(b => `<li>${b.name}: ${b.quantity}</li>`).join('');
    }
}
