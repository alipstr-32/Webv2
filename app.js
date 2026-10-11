// Global App Logic & Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    updateGlobalStats();
});

function updateGlobalStats() {
    const stats = JSON.parse(localStorage.getItem('alip_stats') || '{"processed":0, "success":0, "failed":0, "size":0}');
    
    const elProcessed = document.getElementById('statProcessed');
    const elSuccess = document.getElementById('statSuccess');
    const elFailed = document.getElementById('statFailed');
    const elSize = document.getElementById('statSize');

    if (elProcessed) elProcessed.innerText = stats.processed;
    if (elSuccess) elSuccess.innerText = stats.success;
    if (elFailed) elFailed.innerText = stats.failed;
    if (elSize) elSize.innerText = formatBytes(stats.size);
}

function logActivity(type, name, size, status) {
    const stats = JSON.parse(localStorage.getItem('alip_stats') || '{"processed":0, "success":0, "failed":0, "size":0}');
    stats.processed++;
    if (status === 'success') {
        stats.success++;
        stats.size += size;
    } else {
        stats.failed++;
    }
    localStorage.setItem('alip_stats', JSON.stringify(stats));

    const history = JSON.parse(localStorage.getItem('alip_history') || '[]');
    history.unshift({
        type: type,
        name: name,
        size: formatBytes(size),
        status: status,
        time: new Date().toLocaleString()
    });
    localStorage.setItem('alip_history', JSON.stringify(history));
    updateGlobalStats();
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
