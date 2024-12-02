export async function apiFetch(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`Sending request to ${endpoint}:`, options);

    const response = await fetch(endpoint, options);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error at ${endpoint}:`, response.status, errorText);
        throw new Error(errorText || response.statusText);
    }

    return await response.json();
}

// Funktion für Login
export async function login(username, password) {
    const response = await apiFetch('/api/auth/login', 'POST', { username, password });
    return response.token;
}


// Funktion für Registrierung
export async function register(username, password) {
    return await apiFetch('/api/auth/register', 'POST', { username, password });
    console.log('Register function:', register); // Sollte die Funktion loggen

}




// Funktion für Ressourcen
export async function fetchResources() {
    return await apiFetch('/api/resources');
}

export async function fetchProductionRates() {
    return await apiFetch('/api/resources/production-rates');
}

