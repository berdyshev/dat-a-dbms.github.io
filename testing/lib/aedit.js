/**
 *  Розширене введення даних з контролем типів та налаштування елементів вводу (select, input, contentEditable, обмеження по типу даних, перевірки) *  
**/
function advDataInput(container, cellData, col, rowData, index, isReadOnly) {
    container.innerHTML = "";
    let createdEl = null;

    const typeStr = String(col?.type || "").toLowerCase();
    const isPK = !!col?.primaryKey;
    const isPKAuto = isPK && typeStr === "ціле число" && col?.autoInc === true;
    const isForeignKey = !!(col && col.foreignKey && col.refTable && col.refField);

    // ===== хелпери для caret у contentEditable =====
    const getCaretOffset = (el) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return 0;
        const range = sel.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(range.endContainer, range.endOffset);
        return preRange.toString().length;
    };

    const setCaretOffset = (el, offset) => {
        offset = Math.max(0, Math.min(offset, el.innerText.length));
        const range = document.createRange();
        const sel = window.getSelection();
        let current = 0;

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        let node = walker.nextNode();
        while (node) {
            const len = node.nodeValue.length;
            if (current + len >= offset) {
                range.setStart(node, offset - current);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            current += len;
            node = walker.nextNode();
        }

        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    // універсальний санітайзер для типів
    const sanitizeByType = (s, t) => {
        s = (s ?? "").toString().replace(/\r?\n/g, "");
        t = String(t || "").toLowerCase();
    
        if (t === "текст") {
            if (s.length > 64) s = s.slice(0, 64);
            return s;
        }
        if (t === "ціле число") {
            s = s.replace(/[^\d-]/g, "").replace(/(?!^)-/g, "");
            if (s.startsWith("--")) s = "-" + s.slice(2);
            return s;
        }
        if (t === "дробове число") {
            s = s.replace(/[^\d.\-]/g, "")
                 .replace(/(?!^)-/g, "")
                 .replace(/(\..*)\./g, "$1");
            return s;
        }
        return s;
    };
    

    // ===== FOREIGN KEY =====
    if (isForeignKey) {
        const select = document.createElement("select");

        const emptyOption = document.createElement("option");
        emptyOption.value = "empty";
        emptyOption.textContent = t("aeditEmpty");
        select.appendChild(emptyOption);

        const refTableObj = database.tables.find(t => t.name === col.refTable);
        if (refTableObj) {
            const refIdIndex = refTableObj.schema.findIndex(f => f.title === col.refField); // PK
            let displayIndex = refIdIndex;

            if (col.subst) {
                const idx = refTableObj.schema.findIndex(f => f.title === col.title);
                if (idx !== -1) displayIndex = idx;
            }

            if (refIdIndex !== -1) {
                refTableObj.data.forEach(refRow => {
                    const option = document.createElement("option");
                    option.value = refRow[refIdIndex];          // завжди PK
                    option.textContent = refRow[displayIndex];  // показуємо PK або підставлене значення
                    select.appendChild(option);
                });
    
                select.value = (cellData === null || cellData === undefined || cellData === "")
                    ? "empty"
                    : String(cellData);
            }
        }

        select.disabled = !!isReadOnly;
        container.appendChild(select);
        createdEl = select;

        select.addEventListener("change", () => {
            rowData[index] = select.value === "empty" ? null : select.value; // у таблиці завжди PK
        });
    }
    // ===== BOOLEAN =====
    else if (typeStr === "так/ні" || typeStr === "boolean") {
        const select = document.createElement("select");
        select.innerHTML = `<option value="1">${t("aeditYes")}</option><option value="0">${t("aeditNo")}</option>`;
        select.value = (cellData == 1) ? "1" : "0";
        select.disabled = !!isReadOnly;
        container.appendChild(select);
        createdEl = select;

        select.addEventListener("change", () => {
            rowData[index] = Number(select.value);
        });
    }
    // ===== DATE (замінено на кастомний віджет custom-date-picker) =====
    else if (typeStr === "дата" || typeStr === "date") {
        console.log("cellData=",cellData)
        // Створюємо кастомний віджет (припускається, що datepicker.js вже підключено)
        const picker = document.createElement("custom-date-picker");

        // Визначаємо початкове значення: якщо cellData у форматі YYYY-MM-DD — використовуємо його,
        // інакше ставимо сьогоднішню дату (так само, як у попередній реалізації)
        const asStr = typeof cellData === "string" ? cellData : "";
        const defaultValue = /^\d{4}-\d{2}-\d{2}$/.test(asStr)
            ? asStr
            : new Date().toISOString().split("T")[0];

        // Встановлюємо value через атрибут (setter компонента також викличе change)
        picker.setAttribute("value", defaultValue);

        // Відмітка для доступності / блокування взаємодії
        if (isReadOnly) {
            // Якщо ваш компонент підтримує атрибут disabled — можна встановити його.
            // Багато веб-компонентів ігнорують 'disabled' автоматично, тому додатково блокуємо події.
            picker.setAttribute("aria-disabled", "true");
            picker.style.pointerEvents = "none";
            picker.style.opacity = "0.6";
        } else {
            picker.setAttribute("aria-disabled", "false");
            picker.style.pointerEvents = "";
            picker.style.opacity = "";
        }

        // Ініціалізуємо rowData початковим значенням (такий же поведінковий ефект, як у оригінальному input)
        rowData[index] = defaultValue;

        // При зміні — оновлюємо рядок
        picker.addEventListener("change", (e) => {
            // Компонент повинен мати геттер value, який повертає YYYY-MM-DD або "".
            // Якщо компонент повернув порожній рядок — зберігаємо порожнє значення.
            const val = (typeof picker.value === "string") ? picker.value : (e?.target?.getAttribute?.("value") || "");
            rowData[index] = val === "" ? "" : val;
        });

        container.appendChild(picker);
        createdEl = picker;
    }
    // ===== СПИСОК (dropdown) =====
    else if (typeStr === "список") {
        const select = document.createElement("select");
        const opts = Array.isArray(col.options) ? col.options : [];
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.textContent = t("aeditEmpty");
        select.appendChild(emptyOpt);
        opts.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            select.appendChild(o);
        });
        select.value = opts.includes(String(cellData)) ? String(cellData) : "";
        select.disabled = !!isReadOnly;
        container.appendChild(select);
        createdEl = select;
        select.addEventListener("change", () => { rowData[index] = select.value || null; });
    }
	// ===== IMAGE (URL) =====
    else if (typeStr === "зображення" || typeStr === "image") {
        rowData[index] = cellData || null;
    
        const btn = document.createElement("button");
        const hasImage = !!rowData[index];
        btn.textContent = hasImage ? "🖼️" : "+";
        btn.disabled = !!isReadOnly;
        btn.title = hasImage ? t("aeditImageView") : t("aeditImageAdd"); 
    
        Object.assign(btn.style, {
            border: "none",
            background: "transparent",
            font: "24px Arial, sans-serif",
            cursor: isReadOnly ? "default" : "pointer",
            padding: "0",
            margin: "0",
            outline: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        });
    
        btn.onclick = () => {
            if (isReadOnly) return;
            openImageEditor(col.title, rowData[index], (val) => {
                rowData[index] = val;
                const hasNewImage = !!val;
                btn.textContent = hasNewImage ? "🖼️" : "+";
                btn.title = hasNewImage ? t("aeditImageView") : t("aeditImageAdd");
            });
        };
    
        container.appendChild(btn);
        createdEl = btn;
    }
    // ===== FILE (BLOB) =====
    else if (typeStr === "файл") {
        const hasFile = cellData instanceof Uint8Array && cellData.length > 0;
        const meta = hasFile ? decodeFileBlob(cellData) : null;

        const btn = document.createElement("button");
        btn.textContent = hasFile ? "📎" : "+";
        btn.title = hasFile ? meta.name : t("aeditFileAdd");
        btn.disabled = !!isReadOnly;

        Object.assign(btn.style, {
            border: "none",
            background: "transparent",
            font: "24px Arial, sans-serif",
            cursor: isReadOnly ? "default" : "pointer",
            padding: "0",
            margin: "0",
            outline: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
        });

        btn.onclick = () => {
            if (isReadOnly) return;
            openFileEditor(rowData[index], (val) => {
                rowData[index] = val;
                const newMeta = val ? decodeFileBlob(val) : null;
                btn.textContent = val ? "📎" : "+";
                btn.title = newMeta ? newMeta.name : t("aeditFileAdd");
            });
        };
        container.appendChild(btn);
        createdEl = btn;
    }

    // ===== TEXT / NUMBER (contentEditable) =====
    else { 
        const editable = !isReadOnly && !isPKAuto;
        let displayValue = sanitizeByType(cellData ?? "", typeStr);
        container.textContent = displayValue;
        container.contentEditable = editable ? "true" : "false";
        container.spellcheck = false;
        createdEl = container;
    
        if (editable) {
            container.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const currentRow = container.closest("tr");
                    const nextRow = currentRow?.nextElementSibling;
                    const colIdx = Array.from(currentRow.children).indexOf(container);
                    if (nextRow) {
                        if (typeof highlightRow === "function") highlightRow(nextRow);
                        const nextCell = nextRow.children[colIdx];
                        if (nextCell) nextCell.focus();
                    } else {
                        container.focus();
                    }
                }
            });
    
            container.addEventListener("paste", (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData("text") || "";
                const clean = text.replace(/\r?\n/g, "").replace(/\s+$/g, "");
                document.execCommand("insertText", false, clean);
            });
    
            container.addEventListener("input", () => {
                const oldText = container.innerText;
                const caret = getCaretOffset(container);
                let newText = oldText;
                
                if (typeStr === "ціле число" || typeStr === "дробове число") {
                    newText = sanitizeByType(oldText, typeStr);
                }
    
                if (newText !== oldText) {
                    container.innerText = newText;
                    setCaretOffset(container, Math.min(caret, newText.length));
                }
    
                if (typeStr === "ціле число" || typeStr === "дробове число") {
                    const n = newText === "" ? null : Number(newText);
                    rowData[index] = (n === null || Number.isNaN(n)) ? null : n;
                } else {
                    rowData[index] = newText;
                }
            });
        }
    }
  
    if (createdEl && createdEl !== container) {
        if (container.dataset.tableName) createdEl.dataset.tableName = container.dataset.tableName;
        if (container.dataset.fieldName) createdEl.dataset.fieldName = container.dataset.fieldName;
        if (container.dataset.colIndex)  createdEl.dataset.colIndex  = container.dataset.colIndex;
    }

    return createdEl;
}


/**
 * Функція editData
 * ------------------
 * Призначення: Відображає інтерфейс редагування таблиці або перегляду запиту у модальному вікні.
 * Параметри: tableName — назва таблиці або запиту (з * на початку).
 * Результат: Відкриває модальне вікно з даними для редагування або перегляду.
 * Робота:
 * - Завантажує дані таблиці або результатів запиту з SQLite або об'єкта database.
 * - Якщо таблиці не існує — створює її, базуючись на схемі.
 * - Відображає дані у вигляді таблиці з можливістю редагування.
 **/
/**
 * Відкриває таблицю або результат запиту для редагування
 * (оновлено для підтримки кастомного <custom-date-picker>)
 */
function editData(tableName) {
    let table = null;
    let isReadOnly = false;
    let columns = [];
    let rows = [];

    document.getElementById("savedTablesModal").style.display = "none";
    selectedCell = null;
    const oldSelected = document.querySelector("tr.selected-row");
    if (oldSelected) oldSelected.classList.remove("selected-row");

    const isQueryTable = tableName.startsWith('*');
    console.log("Edit=", tableName);

    if (isQueryTable) {
        const originalQueryName = tableName.substring(1);
        table = queries.results.find(t => t.name === originalQueryName);
        isReadOnly = true;

        if (table) {
            table.schema = (table.schema || []).map(f => ({
                subst: !!f.subst,
                autoInc: (f.autoInc ?? (f.primaryKey && /int/i.test(String(f.type)))),
                ...f
            }));
            columns = table.schema.map(col => col.title);
            rows = table.data;
        }
    } else {
        table = database.tables.find(t => t.name === tableName);
        isReadOnly = false;

        if (table) {
            table.schema = (table.schema || []).map(f => ({
                subst: !!f.subst,
                autoInc: (f.autoInc ?? (f.primaryKey && /int/i.test(String(f.type)))),
                ...f
            }));
            columns = table.schema.map(col => col.title);
            rows = table.data || [];
        }
    }

    if (!table) {
        Message(t("aeditTableQueryNotFound"));
        return;
    }

    currentEditTable = table;
    document.getElementById("editTitle").innerText = isReadOnly
        ? t("aeditQueryTitle", table.name.slice(5))
        : t("aeditTableTitle", table.name);

    const editQueryInfo = document.getElementById("editQueryInfo");
    if (isQueryTable) {
        const queryRawName = table.name.replace(/^запит "/, '').replace(/"$/, '');
        const queryDef = queries.definitions.find(q => q.name === queryRawName);
        document.getElementById("editRowCount").innerText = t("aeditRowCount", rows.length);
        document.getElementById("editSqlText").innerText = queryDef?.sql || '';
        document.getElementById("sqlDetails").removeAttribute("open");
        editQueryInfo.style.display = "block";
    } else {
        editQueryInfo.style.display = "none";
    }

    const head = document.getElementById("editHead");
    const body = document.getElementById("editBody");
    head.innerHTML = "";
    body.innerHTML = "";

    // --- Заголовок ---
    const headerRow = document.createElement("tr");
    columns.forEach((colTitle, i) => {
        const th = document.createElement("th");
        const colSchema = table.schema[i];
        th.textContent = colSchema && colSchema.subst ? colTitle + "🛟" : colTitle;
        th.style.backgroundColor = "#eee";
        if (!isReadOnly && colSchema && colSchema.primaryKey) th.classList.add("pk");
        headerRow.appendChild(th);
    });
    head.appendChild(headerRow);

    // --- Ресайз колонок ---
    (function setupColumnResizing() {
        const tableEl = head.closest('table') || document.getElementById('editTable');
        if (!tableEl) return;

        const oldColgroup = tableEl.querySelector('colgroup');
        if (oldColgroup) oldColgroup.remove();

        const colgroup = document.createElement('colgroup');
        for (let i = 0; i < columns.length; i++) {
            const col = document.createElement('col');
            const w = currentEditTable?.columnWidths?.[i];
            if (w) col.style.width = w + 'px';
            colgroup.appendChild(col);
        }
        tableEl.insertBefore(colgroup, tableEl.querySelector('thead') || tableEl.firstChild);
        tableEl.style.tableLayout = 'fixed';
        tableEl.style.width = tableEl.style.width || '100%';

        tableEl.querySelectorAll('th, td').forEach(el => {
            el.style.overflow = 'hidden';
            el.style.textOverflow = 'ellipsis';
            el.style.whiteSpace = 'nowrap';
        });

        headerRow.querySelectorAll("th").forEach((th, colIndex) => {
            th.style.position = "relative";
            if (th.querySelector('.col-resizer')) return;

            const resizer = document.createElement("div");
            resizer.className = 'col-resizer';
            Object.assign(resizer.style, {
                width: "8px",
                height: "100%",
                position: "absolute",
                top: "0",
                right: "0",
                cursor: "col-resize",
                userSelect: "none",
                zIndex: "20",
                transform: "translateX(50%)"
            });

            th.appendChild(resizer);

            resizer.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const col = tableEl.querySelectorAll('col')[colIndex];
                if (!col) return;

                const startX = e.clientX;
                const startWidth = col.getBoundingClientRect().width;
                const minWidth = 40;
                const prevUserSelect = document.body.style.userSelect;
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';

                function onMouseMove(ev) {
                    const dx = ev.clientX - startX;
                    col.style.width = Math.max(minWidth, Math.round(startWidth + dx)) + 'px';
                    currentEditTable.columnWidths = currentEditTable.columnWidths || [];
                    currentEditTable.columnWidths[colIndex] = parseInt(col.style.width);
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    document.body.style.userSelect = prevUserSelect || '';
                    document.body.style.cursor = '';
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        });
    })();

    // --- Рядки ---
    rows.forEach(rowData => {
        const tr = document.createElement("tr");
        rowData.forEach((cellData, index) => {
            const td = document.createElement("td");
            const colSchema = table.schema[index];

            const el = advDataInput(td, cellData, colSchema, rowData, index, isQueryTable);

            // 🔹 Спеціальна підтримка кастомного datepicker:
            if (el && el.tagName === 'CUSTOM-DATE-PICKER') {
                el.addEventListener("change", () => {
                    rowData[index] = el.value || "";
                });
            }

            td.addEventListener("click", () => {
                if (selectedCell?.parentElement) selectedCell.parentElement.classList.remove("selected-row");
                selectedCell = td;
                selectedCell.parentElement.classList.add("selected-row");
            });

            tr.appendChild(td);
        });
        body.appendChild(tr);
    });

    document.getElementById("addDataRowBtn").style.display = isReadOnly ? 'none' : 'inline-block';
    document.getElementById("deleteSelectedRowBtn").style.display = isReadOnly ? 'none' : 'inline-block';
    document.getElementById("saveTableDataBtn").style.display = isReadOnly ? 'none' : 'inline-block';
    document.getElementById("editModal").style.display = "flex";
}


/**
 * Додає новий рядок до таблиці
 * (оновлено для підтримки кастомного <custom-date-picker>)
 */
function addDataRow() {
    if (!currentEditTable || currentEditTable.name.startsWith('*')) return;

    const tbody = document.getElementById("editBody");
    const tr = document.createElement("tr");

    const newRowData = currentEditTable.schema.map(() => null);
    let firstEditableCell = null;

    currentEditTable.schema.forEach((col, index) => {
        const td = document.createElement("td");
        td.dataset.tableName = currentEditTable.name;
        td.dataset.fieldName = col.title;
        td.dataset.colIndex = index;

        let defaultValue = null;

        // Автоінкремент
        if (col.primaryKey && col.type === "Ціле число" && col.autoInc === true) {
            let max = 0;
            currentEditTable.data.forEach(row => {
                const val = parseInt(row[index]);
                if (!isNaN(val)) max = Math.max(max, val);
            });
            defaultValue = max + 1;
            newRowData[index] = defaultValue;
        }

        // Створюємо елемент введення
        const el = advDataInput(td, defaultValue, col, newRowData, index, false);

        // 🔹 Підтримка кастомного datepicker
        if (el && el.tagName === 'CUSTOM-DATE-PICKER') {
            el.addEventListener("change", () => {
                newRowData[index] = el.value || "";
            });
        }

        // Вибір першої активної клітинки
        if (!firstEditableCell && el && el !== td) firstEditableCell = el;
        else if (!firstEditableCell && td.isContentEditable) firstEditableCell = td;

        td.addEventListener("click", () => {
            selectedCell = td;
            highlightRow(tr);
        });

        tr.appendChild(td);
    });

    currentEditTable.data.push(newRowData);
    tbody.appendChild(tr);

    highlightRow(tr);

    if (firstEditableCell) {
        if (firstEditableCell.focus) firstEditableCell.focus();
        if (firstEditableCell.select) firstEditableCell.select();
    }
}


// Допоміжна функція для виділення рядка
function highlightRow(tr) {
    const tbody = tr.parentElement;
    tbody.querySelectorAll("tr").forEach(row => row.classList.remove("selected-row"));
    tr.classList.add("selected-row");
}

//

let deleteRowCallback = null; // сюди збережемо функцію, яку виконаємо після підтвердження

function confirmDeleteRow(pkValue, onConfirm) {
    // Зберігаємо колбек на підтвердження
    deleteRowCallback = onConfirm;

    // Заповнюємо текст повідомлення
    document.getElementById("deleteMessage").textContent =
        t("aeditDeleteConfirm", pkValue);

    // Показуємо модалку
    document.getElementById("deleteRowModal").style.display = "block";
}

function deleteRowConfirmed() {
    document.getElementById("deleteRowModal").style.display = "none";
    if (typeof deleteRowCallback === "function") {
        deleteRowCallback(true);
    }
    deleteRowCallback = null;
}

function deleteRowCancelled() {
    document.getElementById("deleteRowModal").style.display = "none";
    if (typeof deleteRowCallback === "function") {
        deleteRowCallback(false);
    }
    deleteRowCallback = null;
}
   

/**
* Функція deleteSelectedRow()
* ---------------------------
* Призначення: Видаляє вибраний рядок із таблиці редагування, якщо вона не є запитом і має первинний ключ.
* Параметри: Відсутні (використовує глобальні selectedCell та currentEditTable).
* Результат: Видаляє рядок з DOM і з бази даних, викликає збереження.
* Спосіб роботи:
* - Перевіряє, чи клітинка вибрана та чи таблиця не є запитом;
* - Знаходить індекс стовпця з первинним ключем;
* - Формує SQL-запит DELETE і виконує його;
* - Видаляє рядок із таблиці і зберігає БД.
**/
function deleteSelectedRow() {
    if (!selectedCell || currentEditTable.name.startsWith('*')) {
        Message(t("aeditDeleteSelectFirst"));
        return;
    }

    const row = selectedCell.parentElement;
    const cells = row.querySelectorAll("td");

    // Збираємо всі стовпці, які є частиною PK
    const pkCols = currentEditTable.schema
        .map((col, idx) => col.primaryKey ? { title: col.title, index: idx } : null)
        .filter(Boolean);

    if (pkCols.length === 0) {
        Message(t("aeditNoPrimaryKey"));
        return;
    }

    // Значення першого PK для повідомлення
    const pkValue = cells[pkCols[0].index].innerText.trim();

    // Викликаємо модальне підтвердження
    confirmDeleteRow(pkValue, (confirmed) => {
        if (!confirmed) return;

        // Якщо підтверджено — формуємо SQL і видаляємо
        const whereClauses = pkCols.map(pk => {
            const value = cells[pk.index].innerText.trim();
            return `"${pk.title}" = '${value.replace(/'/g, "''")}'`;
        });

        const sql = `DELETE FROM "${currentEditTable.name}" WHERE ${whereClauses.join(" AND ")};`;

        try {
            db.run(sql);
            row.remove();
            const dataIdx = currentEditTable.data.findIndex(rowArr =>
                pkCols.every(pk => String(rowArr[pk.index]) === cells[pk.index].innerText.trim())
            );
            if (dataIdx !== -1) currentEditTable.data.splice(dataIdx, 1);
            saveDatabase();
        } catch (e) {
            Message(t("aeditDeleteError", e.message));
        }
    });
}
