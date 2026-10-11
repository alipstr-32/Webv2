// Memastikan event listener drag & drop dan file selection berjalan tanpa memicu penolakan gesture browser mobile
function setupDropzone(dropzoneId, inputId, callback) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(inputId);

    if (!fileInput) return;

    // Menangani peristiwa drag-and-drop untuk desktop
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                callback(e.dataTransfer.files);
            }
        });
    }

    // Menangani pemilihan file secara langsung saat file input berubah
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            callback(e.target.files);
        }
    });
}
