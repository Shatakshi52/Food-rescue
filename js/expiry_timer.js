const _timers = {};
function startExpiryCountdown(expiryTimeString, elementId) {
    if (_timers[elementId]) clearInterval(_timers[elementId]);
    const expiry = new Date(expiryTimeString.replace(' ', 'T')).getTime();
    function update() {
        const now = new Date().getTime();
        const diff = expiry - now;

        const el = document.getElementById(elementId);
        if (!el) return;

        if (diff <= 0) {
            el.innerHTML = "<span style='color:red;'>EXPIRED</span>";
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        el.innerHTML = `Expires in ${hours}h ${minutes}m ${seconds}s`;
    }
    update();
    _timers[elementId] = setInterval(update, 1000);
}