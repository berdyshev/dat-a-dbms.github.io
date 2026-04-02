function showData() {
    const dropdown = document.getElementById("data-menu");
    if (!dropdown) {
        console.error(t("dataMenuNotFound") || "Елемент #data-menu не знайдено.");
        return;
    }
    // Отримати всі назви таблиць з  <a > всередині dropdown
    const tableNames = [...dropdown.querySelectorAll("a")].map(a => a.textContent.trim()).filter(name => name);
    if (tableNames.length === 0) {
        Message(t("dataTableListEmpty"));
        return;
    }
    const listEl = document.getElementById("tableListInModal");
    listEl.innerHTML = "";
    listEl.style.listStyle = "none";
    selectedTableNameForEdit = null;
    tableNames.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        li.style.padding = "8px";
        li.style.cursor = "pointer";
        li.dataset.tableName = name;
        li.addEventListener("click", () => {
            [...listEl.children].forEach(el => el.style.background = "");
            li.style.background = "#242d43";
            selectedTableNameForEdit = li.dataset.tableName;
        });
        listEl.appendChild(li);
    });
    document.getElementById("dataModal").style.display = "flex";
}

function confirmOpenSelectedTable() {
    if (!selectedTableNameForEdit) {
        Message(t("dataSelectTableFromList"));
        return;
    }
    document.getElementById("dataModal").style.display = "none";
    openSelectedTable(); // Твоя функція для відкриття
}
let selectedDataWorkName = null;

function showDataWorkDialog() {
    const listEl = document.getElementById("dataWorkList");
    listEl.innerHTML = "";
    selectedDataWorkName = null;
    // Додаємо звичайні таблиці
    (database.tables || []).forEach(t => {
        const li = document.createElement("li");
        li.textContent = t.name;
        li.style.padding = "8px";
        li.style.cursor = "pointer";
        li.addEventListener("click", () => {
            [...listEl.children].forEach(el => el.style.background = "");
            li.style.background = "#242d43";
            selectedDataWorkName = t.name;
        });
        listEl.appendChild(li);
    });
    // Додаємо результати запитів
    (queries.results || []).forEach(q => {
        const li = document.createElement("li");
        li.textContent = "* " + q.name; // * — щоб відрізнити
        li.style.padding = "8px";
        li.style.cursor = "pointer";
        li.addEventListener("click", () => {
            [...listEl.children].forEach(el => el.style.background = "");
            li.style.background = "#242d43";
            selectedDataWorkName = "*" + q.name; // без пробілу — substring(1) поверне точне ім'я
        });
        listEl.appendChild(li);
    });
    document.getElementById("dataWorkModal").style.display = "flex";
}

function closeDataWorkDialog() {
    document.getElementById("dataWorkModal").style.display = "none";
}
let currentDataView = {
    columns: [],
    rows: []
};

function openSelectedDataWork() {
    if (!selectedDataWorkName) {
        Message(t("dataSelectTableOrQuery"));
        return;
    }
    closeDataWorkDialog();
    openDataView(selectedDataWorkName);
}

function openDataView(tableName) {
    let tableData;
    let columns;
    if (tableName.startsWith('*')) {
        const q = queries.results.find(item => item.name === tableName.substring(1));
        if (!q) return Message(t("dataQueryNotFound"));
        columns = q.schema.map(c => c.title);
        tableData = q.data;
    } else {
        const tbl = database.tables.find(tbl => tbl.name === tableName);
        if (!tbl) return Message(t("dataTableNotFound"));
        columns = tbl.schema.map(c => c.title);
        tableData = tbl.data;
    }
    currentDataView.columns = columns;
    currentDataView.rows = [...tableData];
    // Заповнити селект полів
    const select = document.getElementById("dataFieldSelect");
    select.innerHTML = columns.map(c => `<option value="${c}">${c}</option>`).join("");
    // Показати дані
    renderDataViewTable(columns, currentDataView.rows);
    document.getElementById("dataViewTitle").textContent = t("dataTableLabel", tableName);
    document.getElementById("dataViewModal").style.display = "flex";
    document.getElementById("secondFilterContainer").style.display = "none";
    document.getElementById("logicalOperator").selectedIndex = 0;
    document.getElementById("dataFilterInput1").value = "";
    document.getElementById("dataFilterInput2").value = "";
    document.getElementById("dataFilterCondition1").selectedIndex = 0;
    document.getElementById("dataFilterCondition2").selectedIndex = 0;
}

function renderDataViewTable(columns, rows) {
    const head = document.getElementById("dataViewHead");
    const body = document.getElementById("dataViewBody");
    head.innerHTML = "";
    const trHead = document.createElement("tr");
    columns.forEach(c => {
        const th = document.createElement("th");
        th.textContent = c;
        trHead.appendChild(th);
    });
    head.appendChild(trHead);
    body.innerHTML = "";
    rows.forEach(r => {
        const tr = document.createElement("tr");
        r.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

function sortDataTable() {
    const field = document.getElementById("dataFieldSelect").value;
    const order = document.querySelector('input[name="sortOrder"]:checked').value;
    const colIndex = currentDataView.columns.indexOf(field);
    if (colIndex === -1) return;
    currentDataView.rows.sort((a, b) => {
        if (a[colIndex] < b[colIndex]) return order === "asc" ? -1 : 1;
        if (a[colIndex] > b[colIndex]) return order === "asc" ? 1 : -1;
        return 0;
    });
    renderDataViewTable(currentDataView.columns, currentDataView.rows);
}

function toggleSecondFilter() {
    const logicalOp = document.getElementById("logicalOperator").value;
    const container = document.getElementById("secondFilterContainer");
    if (logicalOp === "AND" || logicalOp === "OR") {
        container.style.display = "flex";
    } else {
        container.style.display = "none";
    }
}

function clearFilterInputOnEmpty(selectElement, inputId) {
    if (selectElement.value === "") {
        document.getElementById(inputId).value = "";
    }
}

function applyDataFilter() {
    const condition1 = document.getElementById("dataFilterCondition1").value;
    const mask1 = document.getElementById("dataFilterInput1").value.trim();
    const logicalOp = document.getElementById("logicalOperator").value;
    const condition2 = document.getElementById("dataFilterCondition2").value;
    const mask2 = document.getElementById("dataFilterInput2").value.trim();
    const field = document.getElementById("dataFieldSelect").value;
    const colIndex = currentDataView.columns.indexOf(field);
    if (colIndex === -1) {
        renderDataViewTable(currentDataView.columns, currentDataView.rows);
        return;
    }
    //  Функція для оцінки одного фільтра
    function evaluateFilter(value, condition, mask) {
        if (!condition || !mask) return true; // якщо фільтр не заданий — пропускаємо
        const strValue = String(value);
        if (condition === "=" || condition === "!=") {
            const regex = maskToRegex(mask);
            const matches = regex.test(strValue);
            return condition === "=" ? matches : !matches;
        } else {
            // Числове порівняння
            const numValue = parseFloat(strValue);
            const numMask = parseFloat(mask);
            if (isNaN(numValue) || isNaN(numMask)) return false;
            switch (condition) {
                case ">":
                    return numValue > numMask;
                case "<":
                    return numValue < numMask;
                case ">=":
                    return numValue >= numMask;
                case "<=":
                    return numValue <= numMask;
                default:
                    return true;
            }
        }
    }
    let filtered = currentDataView.rows;
    // Якщо обрано  "+ " або немає другого фільтра — використовуємо лише перший
    if (!logicalOp || !(condition2 && mask2)) {
        if (!condition1 || !mask1) {
            renderDataViewTable(currentDataView.columns, currentDataView.rows);
            return;
        }
        filtered = currentDataView.rows.filter(row => evaluateFilter(row[colIndex], condition1, mask1));
    } else {
        // Обидва фільтри активні
        filtered = currentDataView.rows.filter(row => {
            const pass1 = evaluateFilter(row[colIndex], condition1, mask1);
            const pass2 = evaluateFilter(row[colIndex], condition2, mask2);
            if (logicalOp === "AND") {
                return pass1 && pass2;
            } else if (logicalOp === "OR") {
                return pass1 || pass2;
            }
            return pass1; // fallback
        });
    }
    renderDataViewTable(currentDataView.columns, filtered);
}

function applyDataSearch() {
    const mask = document.getElementById("dataSearchInput").value.toLowerCase();
    if (!mask) {
        renderDataViewTable(currentDataView.columns, currentDataView.rows);
        return;
    }
    const field = document.getElementById("dataFieldSelect").value;
    const colIndex = currentDataView.columns.indexOf(field);
    if (colIndex === -1) return;
    const regex = maskToRegex(mask);
    const filtered = currentDataView.rows.filter(r => regex.test(String(r[colIndex])));
    renderDataViewTable(currentDataView.columns, filtered);
}

function closeDataViewModal() {
    document.getElementById("dataViewModal").style.display = "none";
}

function maskToRegex(mask) {
    // Екрануємо всі спецсимволи RegExp, щоб вони не спрацьовували
    let regexStr = mask.replace(/([.+^${}()|\\])/g, "\\$1");

    // Зірочка (*) → .* (будь-яка кількість символів)
    regexStr = regexStr.replace(/\*/g, ".*");

    // Знак питання (?) → . (один будь-який символ)
    regexStr = regexStr.replace(/\?/g, ".");

    // Решітка (#) → [0-9] (одна будь-яка цифра)
    regexStr = regexStr.replace(/#/g, "[0-9]");

    // [!...] → [^...] (заперечення у регулярках)
    regexStr = regexStr.replace(/\[!([^\]]+)\]/g, "[^$1]");

    // Діапазони та звичайні [ ] залишаємо як є, бо вони вже валідні у RegExp
    // Тут просто забираємо екранування з []
    regexStr = regexStr.replace(/\\\[/g, "[");
    regexStr = regexStr.replace(/\\\]/g, "]");

    return new RegExp("^" + regexStr + "$", "i"); // ^ і $ — щоб збігався весь рядок
}
