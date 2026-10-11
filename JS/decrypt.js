// AES-256-GCM Decryption Engine
let decryptFileObj = null;

document.addEventListener('DOMContentLoaded', () => {
    setupDropzone('dropzoneDecrypt', 'fileInputDecrypt', (files) => {
        decryptFileObj = files[0];
        const info = document.getElementById('fileInfoDecrypt');
        if (info) info.innerHTML = `<strong>File dipilih:</strong> ${decryptFileObj.name} (${formatBytes(decryptFileObj.size)})`;
    });

    const btnDecrypt = document.getElementById('btnDecrypt');
    const btnReset = document.getElementById('btnResetDecrypt');

    if (btnDecrypt) btnDecrypt.addEventListener('click', startDecryption);
    if (btnReset) btnReset.addEventListener('click', () => {
        decryptFileObj = null;
        document.getElementById('fileInfoDecrypt').innerHTML = '';
        document.getElementById('decryptPassword').value = '';
        document.getElementById('decryptResult').innerHTML = '';
    });
});

async function startDecryption() {
    if (!decryptFileObj) {
        alert('Silakan pilih file .alipenc terlebih dahulu.');
        return;
    }
    const password = document.getElementById('decryptPassword').value;
    if (!password) {
        alert('Masukkan password dekripsi.');
        return;
    }

    const resultDiv = document.getElementById('decryptResult');
    resultDiv.innerHTML = '<p style="color: var(--text-muted);">Memproses dekripsi dan verifikasi integritas...</p>';

    try {
        const buffer = await decryptFileObj.arrayBuffer();
        const salt = buffer.slice(0, 16);
        const iv = buffer.slice(16, 28);
        const metaLenView = new Uint32Array(buffer, 28, 1);
        const metaLen = metaLenView[0];
        
        const metaBytes = new Uint8Array(buffer, 32, metaLen);
        const metaStr = new TextDecoder().decode(metaBytes);
        const meta = JSON.parse(metaStr);

        const ciphertext = buffer.slice(32 + metaLen);

        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            ciphertext
        );

        const blob = new Blob([decryptedContent], { type: meta.type || 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(blob);

        resultDiv.innerHTML = `
            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: var(--success);">${meta.name}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Dekripsi berhasil & tervalidasi</div>
                </div>
                <a href="${downloadUrl}" download="${meta.name}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Download File Asli</a>
            </div>
        `;
        logActivity('Decrypt', meta.name, decryptFileObj.size, 'success');
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<p style="color: var(--danger);">Dekripsi gagal! Password salah atau file korup/tidak valid.</p>`;
        logActivity('Decrypt', decryptFileObj.name, decryptFileObj.size, 'failed');
    }
}
