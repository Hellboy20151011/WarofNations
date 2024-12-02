document.addEventListener('DOMContentLoaded', () => {
    // Registrierung
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Verhindert das Neuladen der Seite
            
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value.trim();

            if (!username || !password) {
                alert('Bitte Benutzername und Passwort eingeben!');
                return;
            }

            try {
                await register(username, password);
            } catch (error) {
                console.error('Registrierungsfehler:', error.message);
                alert('Fehler bei der Registrierung: ' + error.message);
            }
        });
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Verhindert das Neuladen der Seite
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (!username || !password) {
                alert('Bitte Benutzername und Passwort eingeben!');
                return;
            }

            try {
                await login(username, password);
            } catch (error) {
                console.error('Login-Fehler:', error.message);
                alert('Fehler beim Login: ' + error.message);
            }
        });
    }
});

// Registrierung
async function register(username, password) {
    try {
        const response = await apiFetch('/api/auth/register', 'POST', { username, password });
        if (response.token) {
            localStorage.setItem('token', response.token); // Token speichern
            console.log('Resources:', response.resources); // Ressourcen loggen
            console.log('Buildings:', response.buildings); // Gebäude loggen
            alert('Registrierung erfolgreich! Sie werden weitergeleitet...');
            window.location.href = '/dashboard.html'; // Weiterleitung zum Dashboard
        } else {
            alert('Registrierung fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.');
        }
    } catch (error) {
        console.error('API-Fehler bei der Registrierung:', error.message);
        alert('Fehler bei der Registrierung: ' + error.message);
    }
}

// Login
async function login(username, password) {
    try {
        const response = await apiFetch('/api/auth/login', 'POST', { username, password });
        if (response.token) {
            localStorage.setItem('token', response.token); // Token speichern
            alert('Login erfolgreich! Sie werden weitergeleitet...');
            window.location.href = '/dashboard.html'; // Weiterleitung zum Dashboard
        } else {
            alert('Login fehlgeschlagen. Bitte prüfen Sie Ihre Eingaben.');
        }
    } catch (error) {
        console.error('API-Fehler beim Login:', error.message);
        alert('Fehler beim Login: ' + error.message);
    }
}

// API-Anfrage-Funktion
async function apiFetch(url, method, body) {
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unbekannter Fehler');
    }

    return response.json();
}
