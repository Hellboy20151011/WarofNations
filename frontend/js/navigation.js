// navigation.js
export function loadNavigation() {
    const navContainer = document.querySelector('.navigation');
    if (navContainer) {
        navContainer.innerHTML = `
            <ul>
                <li><a href="/dashboard.html">Dashboard</a></li>
                <li>
                    <a href="/bauhof.html">Bauhof</a>
                    <ul class="submenu">
                        <li><a href="/geldproduktion.html">Geldproduktion</a></li>
                        <li><a href="/materialproduktion.html">Materialproduktion</a></li>
                    </ul>
                </li>
                <li><button id="logoutButton">Logout</button></li>
            </ul>
        `;

        // Logout-Button-Event hinzufügen
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.href = '/index.html';
            });
        }
    }
}

// Navigation beim Laden der Seite einfügen
document.addEventListener('DOMContentLoaded', loadNavigation);
