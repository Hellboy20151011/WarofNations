import { apiFetch } from './api.js';
import { showPopup } from './dom.js';

export function initializeBuildButtons() {
    console.log('Initializing Build Buttons');

    async function buildBuilding(buildingType, amount) {
        if (isNaN(amount) || amount <= 0) {
            showPopup('Bitte geben Sie eine gültige Anzahl ein.');
            return;
        }

        try {
            await apiFetch('/api/buildings/build', 'POST', { buildingType, amount });
            showPopup(`${amount} Gebäude vom Typ ${buildingType} gebaut!`);
        } catch (error) {
            console.error('Failed to build:', error.message);
            showPopup('Fehler beim Bauen: ' + error.message);
        }
    }

    // Event-Listener für Bau-Buttons hinzufügen
    document.querySelectorAll('.build-button').forEach(button => {
        button.addEventListener('click', () => {
            const buildingType = button.dataset.buildingType;
            const amountInput = document.getElementById(`build-amount-${buildingType}`);
            const amount = parseInt(amountInput.value, 10);

            buildBuilding(buildingType, amount);
        });
    });
}

// Globale Verfügbarkeit für HTML-Events sicherstellen
window.initializeBuildButtons = initializeBuildButtons;
