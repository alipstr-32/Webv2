// Batch File Processor with JSZip
let batchFiles = [];
let batchProcessedResults = [];

document.addEventListener('DOMContentLoaded', () => {
    setupDropzone('dropzoneBatch', 'fileInputBatch', (files) => {
        batchFiles = Array.from(files);
        renderBatchList();
    });

    const btnStart = document.getElementById('btnStartBatch');
    const btnZip = document.getElementById('btnDownloadZip');

    if (btnStart) btnStart.addEventListener('click', runBatchProcess);
    if (btnZip) btnZip.addEventListener('click', downloadBatchZip);
});

function renderBatchList() {
    const container = document.getElementById('batchFileList');
    if (!container) return;
    container.innerHTML = `<p style="color: var(--accent-cyan); font-weight: 500;">${batchFiles.length} file dipilih untuk diproses batch.</p>` +
        batchFiles.map(f => `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.2rem 0;">• ${f.name} (${formatBytes(f.size)})</div>`).join('');
}

async function runBatchProcess() {
    if (batchFiles.length === 0) {
        alert('Pilih file untuk batch processing.');
        return;
    }
    const mode = document.getElementById('batchMode').value;
    const password = document.getElementById('batchPassword').value;
    if (!password) {
        alert('Masukkan password batch.');
        return;
    }

    batchProcessedResults = [];
    const report = document.getElementById('batchReport');
    report.innerHTML = '<p style="color: var(--text-muted);">Memproses batch...</p>';

    let success = 0;
    for (let file of batchFiles) {
        try {
            const buffer = await file.arrayBuffer();
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
            const key = await window.crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);

            const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, buffer);
            const meta = JSON.stringify({ name: file.name, type: file.type });
            const metaBytes = enc.encode(meta);
            const metaLen = new Uint32Array([metaBytes.length]);

            const combined = new Uint8Array(16 + 12 + 4 + metaBytes.byteLength + ciphertext.byteLength);
            combined.set(salt, 0);
            combined.set(iv, 16);
            combined.set(new Uint8Array(metaLen.buffer), 28);
            combined.set(metaBytes, 32);
            combined.set(new Uint8Array(ciphertext), 32 + metaBytes.byteLength);

            batchProcessedResults.push({
                name: file.name + '.alipenc',
                data: combined
            });
            success++;
        } catch (e) {
            console.error(e);
        }
    }

    report.innerHTML = `<p style="color: var(--success);">Batch selesai! Berhasil memproses ${success} dari ${batchFiles.length} file.</p>`;
    if (success > 0) {
        document.getElementById('btnDownloadZip').disabled = false;
    }
}

async function downloadBatchZip() {
    if (batchProcessedResults.length === 0) return;
    const zip = new JSZip();
    batchProcessedResults.forEach(item => {
        zip.file(item.name, item.data);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = "alip_batch_results.zip";
    a.click();
}
