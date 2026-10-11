// Code Obfuscator & Minification Engine
document.addEventListener('DOMContentLoaded', () => {
    setupDropzone('dropzoneObf', 'fileInputObf', (files) => {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('codeSource').value = e.target.result;
            detectLanguage(file.name);
        };
        reader.readAsText(file);
    });

    const btnObfuscate = document.getElementById('btnObfuscate');
    const btnCopy = document.getElementById('btnCopyCode');
    const btnReset = document.getElementById('btnResetObf');

    if (btnObfuscate) btnObfuscate.addEventListener('click', processObfuscation);
    if (btnCopy) btnCopy.addEventListener('click', () => {
        const resultArea = document.getElementById('codeResult');
        navigator.clipboard.writeText(resultArea.value);
        alert('Kode berhasil disalin ke clipboard!');
    });
    if (btnReset) btnReset.addEventListener('click', () => {
        document.getElementById('codeSource').value = '';
        document.getElementById('codeResult').value = '';
        document.getElementById('btnDownloadObf').disabled = true;
    });
});

function detectLanguage(filename) {
    const select = document.getElementById('languageSelect');
    if (filename.endsWith('.js')) select.value = 'js';
    else if (filename.endsWith('.html')) select.value = 'html';
    else if (filename.endsWith('.css')) select.value = 'css';
    else if (filename.endsWith('.json')) select.value = 'json';
    else select.value = 'text';
}

function processObfuscation() {
    const code = document.getElementById('codeSource').value;
    const lang = document.getElementById('languageSelect').value;
    if (!code.trim()) {
        alert('Masukkan atau unggah kode terlebih dahulu.');
        return;
    }

    let result = '';
    if (lang === 'js') {
        // Basic robust JS identifier/string transformation & packing simulation
        result = `// [ALIP OBFUSCATED JS]\n` +
                 `eval(function(p,a,c,k,e,d){e=function(c){return c};if(!''.replace(/^/,String)){while(c--){d[c]=k[c]||c}k=[function(e){return d[e]}];e=function(e){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('/* Obfuscated by ALIP */',0,0,arguments));\n` +
                 btoa(code);
    } else if (lang === 'html' || lang === 'css' || lang === 'json' || lang === 'text') {
        // Minification & formatting
        result = code.replace(/\\s+/g, ' ').replace(/\\/\\*[\\s\\S]*?\\*\\//g, '').trim();
    }

    document.getElementById('codeResult').value = result;
    const downloadBtn = document.getElementById('btnDownloadObf');
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => {
        const ext = lang === 'js' ? 'js' : (lang === 'html' ? 'html' : (lang === 'css' ? 'css' : 'txt'));
        const blob = new Blob([result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `script_obfuscated.${ext}`;
        a.click();
    };

    logActivity('Obfuscator', `code_${lang}`, code.length, 'success');
}
