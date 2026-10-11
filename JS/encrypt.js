// AES-256-GCM Encryption Engine using Web Crypto API
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    setupDropzone('dropzone', 'fileInput', (files) => {
        selectedFiles = Array.from(files);
        renderFileList();
    });

    const btnEncrypt = document.getElementById('btnEncrypt');
    const btnReset = document.getElementById('btnReset');

    if (btnEncrypt) btnEncrypt.addEventListener('click', startEncryption);
    if (btnReset) btnReset.addEventListener('click', resetEncryption);
});

function renderFileList() {
    const container = document.getElementById('fileInfoList');
    if (!container) return;
    container.innerHTML = selectedFiles.map((f, i) => `
        <div style="background: var(--bg-primary); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color);">
            <div>
                <strong>${f.name}</strong> <span style="color: var(--text-muted); font-size: 0.85rem;">(${formatBytes(f.size)})</span>
            </div>
            <button onclick="removeSelectedFile(${i})" style="background:none; border:none; color:var(--danger); cursor:pointer;">Hapus</button>
        </div>
    `).join('');
}

window.removeSelectedFile = function(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
}

async function getKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function startEncryption() {
    if (selectedFiles.length === 0) {
        alert('Silakan pilih setidaknya satu file terlebih dahulu.');
        return;
    }
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!password || password !== confirmPassword) {
        alert('Password kosong atau tidak cocok!');
        return;
    }

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const resultContainer = document.getElementById('resultContainer');

    progressContainer.style.display = 'block';
    resultContainer.innerHTML = '';

    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        progressStatus.innerText = `Mengenkripsi (${i + 1}/${selectedFiles.length}): ${file.name}`;
        progressBar.style.width = `${((i + 1) / selectedFiles.length) * 100}%`;

        try {
            const buffer = await file.arrayBuffer();
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const key = await getKey(password, salt);

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                buffer
            );

            // Construct metadata container
            const meta = JSON.stringify({ name: file.name, type: file.type });
            const metaEncoder = new TextEncoder();
            const metaBytes = metaEncoder.encode(meta);
            const metaLengthBytes = new Uint32Array([metaBytes.length]);

            // Combine: salt (16) + iv (12) + metaLen (4) + meta + ciphertext
            const totalLength = 16 + 12 + 4 + metaBytes.byteLength + ciphertext.byteLength;
            const combined = new Uint8Array(totalLength);
            combined.set(salt, 0);
            combined.set(iv, 16);
            combined.set(new Uint8Array(metaLengthBytes.buffer), 28);
            combined.set(metaBytes, 32);
            combined.set(new Uint8Array(ciphertext), 32 + metaBytes.byteLength);

            const blob = new Blob([combined], { type: 'application/octet-stream' });
            const downloadUrl = URL.createObjectURL(blob);
            const outputName = file.name + '.alipenc';

            resultContainer.innerHTML += `
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color);">
                    <div>
                        <strong style="color: var(--success);">${outputName}</strong>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Berhasil dienkripsi</div>
                    </div>
                    <a href="${downloadUrl}" download="${outputName}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Download</a>
                </div>
            `;
            logActivity('Encrypt', file.name, file.size, 'success');
            successCount++;
        } catch (err) {
            console.error(err);
            logActivity('Encrypt', file.name, file.size, 'failed');
        }
    }

    progressStatus.innerText = `Selesai! ${successCount} dari ${selectedFiles.length} file berhasil dienkripsi.`;
}

function resetEncryption() {
    selectedFiles = [];
    renderFileList();
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('resultContainer').innerHTML = '';
}
