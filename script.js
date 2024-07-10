let numberData = [];

function generateTable() {
    if (numberData.length > 0 && !confirm('Generating a new table will clear the existing data. Continue?')) {
        return;
    }

    const rangeStart = parseInt(document.getElementById('rangeStart').value);
    const rangeEnd = parseInt(document.getElementById('rangeEnd').value);

    numberData = [];
    for (let i = rangeStart; i <= rangeEnd; i++) {
        numberData.push({ number: i, selectedCount: 0, name: '' });
    }

    saveToStorage();
    displayTable();
}

function calculateProbabilities() {
    const totalNumbers = numberData.length;
    const pBase = 1 / totalNumbers;
    let initialProbabilities = [];

    numberData.forEach(item => {
        let pInitial = pBase * (1 / (item.selectedCount + 1));
        initialProbabilities.push(pInitial);
    });

    let updatedProbabilities = [...initialProbabilities];
    for (let i = 0; i < totalNumbers; i++) {
        let pDiff = pBase - initialProbabilities[i];
        for (let j = 0; j < totalNumbers; j++) {
            if (i !== j) {
                updatedProbabilities[j] += pDiff / (totalNumbers - 1);
            }
        }
    }

    return updatedProbabilities;
}

function displayTable() {
    let tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    if (numberData.length > 0) {
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        let headerRow = document.createElement('tr');
        let th1 = document.createElement('th');
        th1.innerText = 'Number';
        let th2 = document.createElement('th');
        th2.innerText = 'Name';
        let th3 = document.createElement('th');
        th3.innerText = 'Selected Count';
        let th4 = document.createElement('th');
        th4.innerText = 'Current Probability';

        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        headerRow.appendChild(th3);
        headerRow.appendChild(th4);
        thead.appendChild(headerRow);

        let updatedProbabilities = calculateProbabilities();
        let totalProbability = 0;

        for (let i = 0; i < numberData.length; i++) {
            totalProbability += updatedProbabilities[i];
            let row = document.createElement('tr');
            let td1 = document.createElement('td');
            td1.innerText = numberData[i].number;
            let td2 = document.createElement('td');
            td2.contentEditable = true;
            td2.innerText = numberData[i].name;
            td2.onblur = function() {
                numberData[i].name = td2.innerText.trim();
                saveToStorage();
            };
            let td3 = document.createElement('td');
            td3.innerText = numberData[i].selectedCount;
            let td4 = document.createElement('td');
            td4.innerText = updatedProbabilities[i].toFixed(4);

            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            row.appendChild(td4);
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        document.getElementById('probabilitySum').innerText = `Sum of Probabilities: ${totalProbability.toFixed(4)}`;
    }
}

function selectRandomNumber() {
    if (numberData.length === 0) {
        alert('No data available to select a random number.');
        return;
    }

    let updatedProbabilities = calculateProbabilities();
    const sumOfProbabilities = updatedProbabilities.reduce((sum, p) => sum + p, 0);
    const random = Math.random() * sumOfProbabilities;

    let cumulativeProbability = 0;
    let selectedNumber = null;
    for (let i = 0; i < numberData.length; i++) {
        cumulativeProbability += updatedProbabilities[i];
        if (random <= cumulativeProbability) {
            selectedNumber = numberData[i].number;
            numberData[i].selectedCount++;
            break;
        }
    }

    saveToStorage();
    document.getElementById('selectedNumber').innerText = `Selected Number: ${selectedNumber}`;
    displayTable();
}

function exportToCSV() {
    if (numberData.length === 0) {
        alert('No data available to export.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Number,Name,Selected Count\n";
    numberData.forEach(item => {
        let sanitized = item.name.replace(/\r?\n|\r/g, '');
        csvContent += `${item.number},${sanitized},${item.selectedCount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'number_data.csv');
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

function importFromCSV() {
    if (numberData.length > 0 && !confirm('Importing new data will clear the existing data. Continue?')) {
        return;
    }

    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Skip header row
        numberData = rows.map(row => {
            const columns = row.split(',');
            if (columns.length === 3) {
                const [number, name, selectedCount] = columns;
                return {
                    number: parseInt(number),
                    name: name.trim(),
                    selectedCount: parseInt(selectedCount)
                };
            }
        }).filter(item => item && !isNaN(item.number));
        saveToStorage();
        displayTable();
    };

    if (file) {
        reader.readAsText(file);
    }
}

function clearAllData() {
    if (numberData.length === 0) {
        alert('No data to clear.');
        return;
    }

    if (!confirm('Are you sure you want to clear all data?')) {
        return;
    }

    numberData = [];
    localStorage.removeItem('numberData');
    displayTable();
}

function saveToStorage() {
    localStorage.setItem('numberData', JSON.stringify(numberData));
}

function loadFromStorage() {
    const storedData = localStorage.getItem('numberData');
    if (storedData) {
        numberData = JSON.parse(storedData);
        displayTable();
    }
}

// Load data from localStorage on page load
window.addEventListener('load', loadFromStorage);
