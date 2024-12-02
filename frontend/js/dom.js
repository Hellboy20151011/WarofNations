// dom.js
export function updateResourceDisplay(resources) {
    document.getElementById('money').innerText = resources.money || 0;
    document.getElementById('stone').innerText = resources.stone || 0;
    document.getElementById('metal').innerText = resources.metal || 0;
    document.getElementById('power').innerText = resources.power || 0;
    document.getElementById('fuel').innerText = resources.fuel || 0; // Treibstoff
}



export function showPopup(message) {
    const popup = document.getElementById('popup');
    popup.innerText = message;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
}
