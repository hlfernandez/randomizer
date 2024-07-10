let numberData = [];

function generateTable() {
    const rangeStart = parseInt(document.getElementById('rangeStart').value);
    const rangeEnd = parseInt(document.getElementById('rangeEnd').value);
    numberData = [];

    for (let i = rangeStart; i <= rangeEnd; i++) {
        numberData.push({ number: i, selectedCount: 0 });
    }

    displayTable();
}

function calculateProbabilities() {
    const totalNumbers = numberData.length;
    const pBase = 1 / totalNumbers;
    let initialProbabilities = [];

    // Step 1: Compute initial probabilities
    numberData.forEach(item => {
        let pInitial = pBase * (1 / (item.selectedCount + 1));
        initialProbabilities.push(pInitial);
    });

    // Step 2: Update probabilities
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
        th2.innerText = 'Selected Count';
        let th3 = document.createElement('th');
        th3.innerText = 'Current Probability';

        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        headerRow.appendChild(th3);
        thead.appendChild(headerRow);

        let updatedProbabilities = calculateProbabilities();
        let totalProbability = 0;

        for (let i = 0; i < numberData.length; i++) {
            totalProbability += updatedProbabilities[i];
            let row = document.createElement('tr');
            let td1 = document.createElement('td');
            td1.innerText = numberData[i].number;
            let td2 = document.createElement('td');
            td2.innerText = numberData[i].selectedCount;
            let td3 = document.createElement('td');
            td3.innerText = updatedProbabilities[i].toFixed(4);

            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        document.getElementById('probabilitySum').innerText = `Sum of Probabilities: ${totalProbability.toFixed(4)}`;
    }
}

function selectRandomNumber() {
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

    document.getElementById('selectedNumber').innerText = `Selected Number: ${selectedNumber}`;
    displayTable();
}
