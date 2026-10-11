// History Management & Cleanup
document.addEventListener('DOMContentLoaded', () => {
    renderHistoryTable();
    const btnClear = document.getElementById('btnClearHistory');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            localStorage.removeItem('alip_history');
            localStorage.removeItem('alip_stats');
            renderHistoryTable();
            updateGlobalStats();
            alert('Riwayat dan statistik dibersihkan.');
        });
    }
});

function renderHistoryTable() {
    const container = document.getElementById('historyTableContainer');
    if (!container) return;

    const history = JSON.parse(localStorage.getItem('alip_history') || '[]');
    if (history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Belum ada riwayat aktivitas.</p>';
        return;
    }

    container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 0.75rem;">Operasi</th>
                    <th style="padding: 0.75rem;">Nama File</th>
                    <th style="padding: 0.75rem;">Ukuran</th>
                    <th style="padding: 0.75rem;">Status</th>
                    <th style="padding: 0.75rem;">Waktu</th>
                </tr>
            </thead>
            <tbody>
                ${history.map(h => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.75rem; font-weight: 500;">${h.type}</td>
                        <td style="padding: 0.75rem;">${h.name}</td>
                        <td style="padding: 0.75rem; color: var(--text-muted);">${h.size}</td>
                        <td style="padding: 0.75rem;"><span style="color: ${h.status === 'success' ? 'var(--success)' : 'var(--danger)'};">${h.status}</span></td>
                        <td style="padding: 0.75rem; color: var(--text-muted);">${h.time}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
