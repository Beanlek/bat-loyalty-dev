document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const fileInput = document.querySelector('input[type="file"]');
    const submitButton = document.querySelector('button[type="submit"]');
    const resultContainer = document.createElement('div');
    form.appendChild(resultContainer);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        submitButton.disabled = true;
        submitButton.textContent = 'Uploading...';

        try {
            const response = await fetch('/a/ocr/ocrPost', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            submitButton.disabled = false;
            submitButton.textContent = 'Upload';

            if (response.ok) {
                resultContainer.textContent = `Extracted Text: ${JSON.stringify(result.ocrText)}`;
            } else {
                resultContainer.textContent = `Error: ${result.errMsg}`;
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Upload';
            resultContainer.textContent = 'An error occurred while uploading the file.';
        }
    });
});
