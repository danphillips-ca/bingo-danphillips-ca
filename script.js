document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        showToast('Info', 'Processing file, please wait...', 'info');
        readFileContent(file).then(content => {
            const processedData = processFileContent(content);
            encryptAsHash(JSON.stringify(processedData)).then(hash => {
                localStorage.setItem(hash, JSON.stringify(processedData));
                const url = `${window.location.origin}${window.location.pathname}?hash=${hash}`;
                console.log('Shareable URL:', url);
                displayShareableLink(url);
                showToast('Success', 'File processed successfully!', 'success');
            }).catch(error => {
                showToast('Error', 'Error generating hash. Please try again.', 'danger');
            });
            populateGameboard(processedData);
        }).catch(error => {
            showToast('Error', 'Error processing file. Please check the file format and try again.', 'danger');
        });
    }
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
    });
}

function generateShareableUrl(data) {
    return encryptAsHash(JSON.stringify(data)).then(hash => {
        const encodedData = encodeURIComponent(JSON.stringify(data));
        const url = `${window.location.origin}${window.location.pathname}?hash=${hash}`;
        console.log('Shareable URL:', url);
        return url;
    });
}

function processFileContent(content) {
    try {
        const lines = content.split('\n');
        const result = [];
        let currentColumn = null;

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('# ') && !line.startsWith('## ')) {
                const headerText = line.slice(1).trim();
                result.push({ header: headerText });
            } else if (line.startsWith('## ')) {
                if (currentColumn) {
                    result.push(currentColumn);
                }
                const columnText = line.slice(2).trim();
                currentColumn = { column: columnText, values: [] };
            } else if (currentColumn && line) {
                const value = isNaN(line) ? line : Number(line);
                currentColumn.values.push(value);
            }
        });

        if (currentColumn) {
            result.push(currentColumn);
        }

        return result;
    } catch (error) {
        console.error('Error processing file content:', error);
        throw error;
    }
}

async function encryptAsHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    const hexCodes = [...byteArray].map(byte => byte.toString(16).padStart(2, '0'));
    return hexCodes.join('');
}

function populateGameboard(data) {
    const container = document.getElementById('gameboardContainer');
    container.innerHTML = '';

    const header = data.find(item => item.header)?.header;
    if (!header) {
        showToast('Error', 'Header not found in data', 'danger');
        return;
    }

    const columns = data.filter(item => item.column && item.column !== 'Free');
    if (columns.length === 0) {
        showToast('Error', 'No columns found in data', 'danger');
        return;
    }

    const freeColumn = data.find(item => item.column === 'Free');
    if (!freeColumn) {
        showToast('Error', 'Free column not found in data', 'danger');
        return;
    }

    const headerElement = document.createElement('h1');
    headerElement.textContent = header;
    container.appendChild(headerElement);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'col-lg-8 col-md-10 col-12';

    const grid = document.createElement('div');
    grid.className = 'row';

    const firstRow = document.createElement('div');
    firstRow.className = 'row';
    columns.forEach(col => {
        const card = createCard(col.column);
        firstRow.appendChild(card);
    });
    grid.appendChild(firstRow);

    const usedValues = new Set();
    for (let i = 1; i <= 5; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 5; j++) {
            if (i === 3 && j === 2) {
                const freeValue = getRandomValue(freeColumn.values, usedValues);
                const card = createCard(freeValue);
                row.appendChild(card);
            } else {
                const column = columns[j];
                const value = getRandomValue(column.values, usedValues);
                const card = createCard(value);
                row.appendChild(card);
            }
        }
        grid.appendChild(row);
    }

    gridContainer.appendChild(grid);
    container.appendChild(gridContainer);
}

function createCard(text) {
    const cardCol = document.createElement('div');
    cardCol.className = 'col p-1';

    const card = document.createElement('div');
    card.className = 'card h-100';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex align-items-center justify-content-center';
    cardBody.textContent = text;

    card.appendChild(cardBody);
    cardCol.appendChild(card);

    return cardCol;
}

function getRandomValue(values, usedValues) {
    let value;
    do {
        const randomIndex = Math.floor(Math.random() * values.length);
        value = values[randomIndex];
    } while (usedValues.has(value));
    usedValues.add(value);
    return value;
}

function displayShareableLink(url) {
    const container = document.getElementById('shareableUrlContainer');
    container.innerHTML = ''; // Clear any previous content

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.className = 'form-control';
    inputElement.value = url;
    inputElement.disabled = true;
    inputElement.setAttribute('aria-label', 'Shareable URL');

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.className = 'input-group-append';

    const copyButton = document.createElement('button');
    copyButton.className = 'btn btn-primary';
    copyButton.innerHTML = '<i class="bi bi-share"></i>'; // Updated icon for copy
    copyButton.setAttribute('aria-label', 'Copy URL');

    // Remove rounded edges between input and button
    inputElement.style.borderTopRightRadius = '0';
    inputElement.style.borderBottomRightRadius = '0';
    copyButton.style.borderTopLeftRadius = '0';
    copyButton.style.borderBottomLeftRadius = '0';

    copyButton.onclick = function() {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Success', 'URL copied to clipboard', 'success');
        }).catch(err => {
            console.error('Error copying URL: ', err);
            showToast('Error', 'Failed to copy URL', 'danger');
        });
    };

    inputGroupAppend.appendChild(copyButton);
    inputGroup.appendChild(inputElement);
    inputGroup.appendChild(inputGroupAppend);
    container.appendChild(inputGroup);
}

function showToast(title, message, type) {
    const toastContainer = document.getElementById('toast-container');
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get('hash');
    if (hash) {
        const storedData = localStorage.getItem(hash);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log('Data from local storage:', parsedData);  // Debugging
            populateGameboard(parsedData);
        } else {
            showToast('Error', 'Data not found in local storage.', 'danger');
        }
    }
}
