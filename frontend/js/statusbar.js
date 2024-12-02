// Funktion zum Aktualisieren der Statusleiste
export function updateStatusBar(resources) {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return;

    resources.forEach(resource => {
        console.log(`Updating ${resource.name}-display with value: ${resource.amount}`);
        const element = document.getElementById(`${resource.name}-display`);
        if (element) {
            element.textContent = resource.amount; // Wert aktualisieren
        } else {
            console.warn(`Element with ID ${resource.name}-display not found`);
        }
    });
}


// Funktion zum Laden der Ressourcen und Aktualisieren der Statusleiste
async function loadStatusBar() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found for authentication');
        return;
    }

    try {
        const response = await fetch('/api/resources', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch resources: ${response.statusText}`);
        }

        const resources = await response.json();
        console.log('Resources fetched for status bar:', resources);

        resources.forEach(resource => {
            console.log(`Updating status bar for resource: ${resource.name}, amount: ${resource.amount}`);
            const element = document.getElementById(`${resource.name}-display`);
            if (element) {
                element.textContent = parseFloat(resource.amount).toFixed(2);
            } else {
                console.warn(`No status bar element found for resource: ${resource.name}`);
            }
        });
    } catch (err) {
        console.error('Error loading status bar:', err.message);
    }
}


// Statusleiste beim Laden der Seite initialisieren
document.addEventListener('DOMContentLoaded', loadStatusBar);
