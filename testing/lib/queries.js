/**
 * Залишаємо тільки зв'язки через FOREIGN KEY
 **/ 
function resetNonReadonlyRelations() {
    if (!Array.isArray(database.relations)) return;
    database.relations = database.relations.filter(r => r.readonly === true);
   
}
 
/** 
 * Ініціалізує створення нового SQL-запиту 
 * Показує модальне вікно конструктора запиту
 **/
function createQuery() {
	if(!isDBExist()) return
    resetNonReadonlyRelations();
    document.getElementById("queryName").value = t("queryDefaultName"); // Назва за замовчуванням
    document.getElementById("queryBody").innerHTML = ""; // Очистити старі рядки
    // Очистити таблицю JOIN-зв'язків
    const joinTable = document.getElementById("joinBody");
    if (joinTable) {
        const tbody = joinTable.querySelector("tbody");
        if (tbody) {
            tbody.innerHTML = ""; // Очистити всі рядки JOIN
        }
        joinTable.style.display = "none"; // Приховати таблицю JOIN
    }
    
    // Очистити базову таблицю (FROM)
    const fromTableSelect = document.getElementById("fromTable");
    if (fromTableSelect) {
        fromTableSelect.value = ""; // Скинути вибір
    }
    addQueryRow(); // Додати перший рядок
    document.getElementById("queryModal").style.display = "flex"; // Показати вікно
    populateTableDropdowns(); // Заповнити випадаючі списки таблиць
    toggleStructureButtonVisibility(true);
}
/** 
 * Додає новий рядок до конструктора запиту
 * Рядок містить вибір таблиці, поля, видимість, сортування, фільтр
 **/
function fillSortSelect(select) {
    [
        { value: "",     key: "sortNone" },
        { value: "ASC",  key: "sortAsc"  },
        { value: "DESC", key: "sortDesc" },
    ].forEach(({ value, key }) => {
        const opt = document.createElement("option");
        opt.value = value;        
        opt.textContent = t(key);
        select.appendChild(opt);
    });
}

function fillOperatorSelect(select) {
    [
        { value: "==",          key: "opEqual"      },
        { value: "<",           key: "opLess"        },
        { value: "<=",          key: "opLessEq"      },
        { value: ">",           key: "opGreater"     },
        { value: ">=",          key: "opGreaterEq"   },
        { value: "!=",          key: "opNotEq"       },
        { value: "LIKE",        key: "opLike"        },
        { value: "IN",          key: "opIn"          },
        { value: "NOT IN",      key: "opNotIn"       },
        { value: "BETWEEN",     key: "opBetween"     },
        { value: "NOT BETWEEN", key: "opNotBetween"  },
    ].forEach(({ value, key }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = value;
        opt.title = t(key);
        select.appendChild(opt);
    });
}

function fillRoleSelect(select) {
    select.title = t("roleParticipation");
    [
        { value: "select", label: "----",  key: null          },
        { value: "count",  label: "COUNT", key: "roleCount"   },
        { value: "sum",    label: "SUM",   key: "roleSum"     },
        { value: "avg",    label: "AVG",   key: "roleAvg"     },
        { value: "min",    label: "MIN",   key: "roleMin"     },
        { value: "max",    label: "MAX",   key: "roleMax"     },
    ].forEach(({ value, label, key }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        if (key) opt.title = t(key);
        select.appendChild(opt);
    });
}

function addQueryRow() {
    const tbody = document.getElementById("queryBody");
    const row = document.createElement("tr");
    
    row.innerHTML = `
        <td><select class="query-table-select" onchange="populateFieldDropdown(this)"></select></td>
        <td><select class="query-field-select"></select></td>
        <td><input type="checkbox" checked class="query-visible-checkbox"></td>
        <td><select class="query-sort-select"></select></td>
        <td>
            <div style="display: flex; gap: 4px; align-items: center;">
                <select class="query-operator-select" style="width: 60px;"></select>
                <input type="text" class="query-criteria-input" style="flex: 1;">
            </div>
        </td>
        <td>
            <select class="query-field-role" onchange="toggleAliasInput(this)"></select>
            <input type="text" class="query-alias-input" style="margin-top:4px; display:none; width:100%;height:1.5em;">
        </td>
        <td><select class="group-field-select"></select></td>
        <td><button onclick="deleteQueryRow(this)">❌</button></td>
    `;

    tbody.appendChild(row);

    fillSortSelect(row.querySelector(".query-sort-select"));
    fillOperatorSelect(row.querySelector(".query-operator-select"));
    fillRoleSelect(row.querySelector(".query-field-role"));

    row.querySelector(".query-alias-input").placeholder = t("queryAlias");

    populateTableDropdownsForRow(row);
}

/**
 * функція для показу/приховування input псевдоніма
 **/
function toggleAliasInput(selectEl) {
    const row = selectEl.closest("tr");
    const aliasInput = row.querySelector(".query-alias-input");
    console.log("toggleAliasInput=",selectEl.value)
    if (selectEl.value !== "select") {
        aliasInput.style.display = "block";
    } else {
        aliasInput.style.display = "none";
        aliasInput.value = "";
    }
}


/** 
 * Видаляє рядок з конструктора запиту
 * Параметр:
 *   button — кнопка ❌, яка викликала подію
 **/
function deleteQueryRow(button) {
    const row = button.closest("tr"); // Знайти відповідний рядок
    row.remove(); // Видалити рядок
}

/** 
 * Заповнює всі випадаючі списки таблиць у конструкторі запиту
 **/
function populateTableDropdowns() {
    const tableSelects = document.querySelectorAll(".query-table-select"); // Всі селекти таблиць
    
    tableSelects.forEach(select => {
        console.log("Заповнюється:", select.id);
        select.innerHTML = "<option value=''>" + t("querySelectTable") + "</option>"; // Початковий варіант
        database.tables.forEach(table => {
            const option = document.createElement("option");
            option.value = table.name;
            option.textContent = table.name;
            select.appendChild(option); // Додати назву таблиці
        });
    });
}

/**
 * Заповнює список таблиць у конкретному рядку конструктора запиту
 * Параметр:
 *   row — рядок, у якому потрібно заповнити список
 **/
function populateTableDropdownsForRow(row) {
    const select = row.querySelector(".query-table-select");
    select.innerHTML = "<option value=''>" + t("querySelectTable") + "</option>";
    database.tables.forEach(table => {
        const option = document.createElement("option");
        option.value = table.name;
        option.textContent = table.name;
        select.appendChild(option);
    });
}


/** 
 * Заповнює список полів таблиці на основі вибраної таблиці
 * Параметр:
 *   tableSelect — select-елемент з вибраною таблицею
 **/
function populateFieldDropdown(tableSelect) {
    const row = tableSelect.closest("tr");
    if (!row) {
        console.error("populateFieldDropdown: викликано з елемента поза <tr>", tableSelect);
        return;
    }

    const fieldSelect = row.querySelector(".query-field-select");
    const groupSelect = row.querySelector(".group-field-select");

    if (!fieldSelect || !groupSelect) {
        console.error("populateFieldDropdown: не знайдено fieldSelect або groupSelect у рядку", row);
        return;
    }

    // Далі код без змін...
    fieldSelect.innerHTML = "";
    groupSelect.innerHTML = "";
    const selectedTableName = tableSelect.value;
    if (!selectedTableName) {
        fieldSelect.disabled = true;
        return;
    }

    const selectedTable = database.tables.find(t => t.name === selectedTableName);
    if (!selectedTable) return;

    fieldSelect.disabled = false;
    groupSelect.disabled = false;

    // Додати опцію "* (всі поля)" на початок
    const starOption = document.createElement("option");
    starOption.value = "*";
    starOption.textContent = "* (Всі поля)";
    fieldSelect.appendChild(starOption);

    // Додати реальні поля таблиці
    selectedTable.schema.forEach(field => {
        const option = document.createElement("option");
        option.value = field.title;
        option.textContent = field.title;
        fieldSelect.appendChild(option);        
    });

    const startOption = document.createElement("option");
    startOption.value = "";
    startOption.textContent = "----";
    groupSelect.appendChild(startOption);

    selectedTable.schema.forEach(field => {
        const option = document.createElement("option");
        option.value = field.title;
        option.textContent = field.title;        
        groupSelect.appendChild(option);
    });
}



/** 
 * Повертає тип поля у вказаній таблиці
 * Параметри:
 *   tableName — назва таблиці
 *   fieldName — назва поля
 * Повертає: тип поля або порожній рядок
 */
function getFieldType(tableName, fieldName) {
    console.log("getFieldType=", database); // Діагностика
    const table = database.tables.find(t => t.name === tableName); // Знайти таблицю
    if (!table) return ""; // Якщо не знайдено — повернути ""
    const field = table.schema.find(f => f.title === fieldName); // Знайти поле
    console.log("getFieldType Field=", field); // Діагностика
    return field?.type || ""; // Повернути тип або "" якщо нема
}

//**************************************************************************
function isParameterPlaceholder(v) {
    return /^\[.*\]$/.test(v.trim());
}
    
function generateSqlQuery() {
    const queryName = document.getElementById("queryName").value.trim();
    if (queryName==="") {
		Message(t("queryNoName"));
		return
	}
    const rows = document.querySelectorAll("#queryBody tr");

    let selectFields = [];
    let groupByFields = [];
    let baseTable = null;
    const fromTableEl = document.getElementById("fromTable");
    
    if (fromTableEl && fromTableEl.value.trim() !== "") {
        baseTable = fromTableEl.value.trim();
    } else {
        baseTable = null;
    }
    let joins = [];
    let whereClauses = [];
    let orderByClauses = [];
    const queryConfig = [];

    let hasSelect = false;
    let hasAggregate = false;
    let aggregateAliasCounter = 0;

    // --- helpers ---
    const sqlQuote = (s) => `'${String(s).replace(/'/g, "''")}'`;
    const parseList = (raw) => {
        if (!raw) return [];
        let s = raw.trim();
        if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1);
        return s.split(",").map(v => v.trim()).filter(v => v.length);
    };
    const isNumericLiteral = (v) => /^-?\d+(?:\.\d+)?$/.test(String(v).trim());
    const toIsoDate = (v) => {
        const s = String(v).trim();
        let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        m = s.match(/^(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        return s;
    };
    const formatLiteral = (v, fieldType) => {
        const raw = String(v).trim().replace(/^'(.*)'$/, "$1");
        if (fieldType === "Дата") return sqlQuote(toIsoDate(raw));
        if (fieldType === "Так/Ні") {
            const L = raw.toLowerCase();
            if (["так","true","1"].includes(L)) return "1";
            if (["ні","false","0"].includes(L)) return "0";
            return isNumericLiteral(raw) ? raw : sqlQuote(raw);
        }
        return isNumericLiteral(raw) ? raw : sqlQuote(raw);
    };

    rows.forEach(row => {
        const tableName = row.querySelector(".query-table-select").value;
        const fieldName = row.querySelector(".query-field-select")?.value || "";
        const groupName = row.querySelector(".group-field-select")?.value || "";
        const isVisible = row.querySelector(".query-visible-checkbox").checked;
        const sortBy = row.querySelector(".query-sort-select").value;
        const operator = row.querySelector(".query-operator-select").value.trim();
        const criteria = row.querySelector(".query-criteria-input").value.trim();
        const fieldRole = row.querySelector(".query-field-role").value;
        let alias = row.querySelector(".query-alias-input").value.trim();

        if (!tableName || (!fieldName && fieldName !== "*")) return;
        if (!baseTable && tableName !== "*") baseTable = tableName;

        let fieldExpr = fieldName === "*"
            ? `"${tableName}".*`
            : `"${tableName}"."${fieldName}"`;

        // --- SELECT ---
        let selectExpr = "";
        if (fieldName === "*") {
            selectExpr = fieldExpr;
            hasSelect = true;
        } else {
            switch (fieldRole) {
                case "count":
                case "sum":
                case "avg":
                case "min":
                case "max":
                    if (!alias) alias = `${fieldRole}_${aggregateAliasCounter++}`;
                    selectExpr = `${fieldRole.toUpperCase()}(${fieldExpr}) AS ${alias}`;
                    hasAggregate = true;
                    break;
                case "select":
                default:
                    selectExpr = alias ? `${fieldExpr} AS ${alias}` : fieldExpr;
                    hasSelect = true;
                    break;
            }
        }
        if (isVisible && selectExpr) selectFields.push(selectExpr);

        // --- GROUP BY ---
        if (groupName) {
            const expr = `"${tableName}"."${groupName}"`;
            if (!groupByFields.includes(expr)) {
                groupByFields.push(expr);
            }
        }

        // --- WHERE ---
        if (fieldName !== "*" && operator) {
            const fieldType = getFieldType(tableName, fieldName);
            const op = operator.toUpperCase();
            if (op === "IS NULL" || op === "IS NOT NULL") {
                whereClauses.push(`${fieldExpr} ${op}`);
            } else if (op === "IN" || op === "NOT IN") {
                const items = parseList(criteria);
                const values = items.map(v => formatLiteral(v, fieldType));
                if (values.length) whereClauses.push(`${fieldExpr} ${op} (${values.join(", ")})`);
            } else if (op.includes("BETWEEN")) {
                const parts = criteria.split(/\s+AND\s+/i);
                if (parts.length === 2) {
                    const left = formatLiteral(parts[0], fieldType);
                    const right = formatLiteral(parts[1], fieldType);
                    whereClauses.push(`${fieldExpr} ${op} ${left} AND ${right}`);
                }
            } else if (criteria) {
                let right = isParameterPlaceholder(criteria)
                    ? criteria
                    : formatLiteral(criteria, fieldType);
                whereClauses.push(`${fieldExpr} ${op} ${right}`);
            }
        }

        // --- ORDER BY ---
        if (sortBy) {
            if (alias) orderByClauses.push(`${alias} ${sortBy}`);
            else if (fieldName !== "*") orderByClauses.push(`${fieldExpr} ${sortBy}`);
        }

        // --- save config row ---
        queryConfig.push({
            tableName, fieldName, isVisible,
            sortBy, operator, criteria,
            fieldRole, alias, groupName
        });
    });

    // --- JOIN ---
    const joinRows = document.querySelectorAll("#joinBody tbody tr");
    joinRows.forEach(row => {
        const tableA = row.querySelector(".join-table-a").value;
        const fieldA = row.querySelector(".join-field-a").value;
        const tableB = row.querySelector(".join-table-b").value;
        const fieldB = row.querySelector(".join-field-b").value;
        if (tableA && fieldA && tableB && fieldB) {
            joins.push({
                table: tableA,
                condition: `"${tableA}"."${fieldA}" = "${tableB}"."${fieldB}"`
            });
            if (!baseTable) baseTable = tableA;
        }
    });

    if (selectFields.length === 0) {
        Message(t("queryNoVisibleFields"));
        return;
    }
    if (!baseTable) {
        if (joins.length > 0) baseTable = joins[0].table;
        else {
            Message(t("queryNoBaseTable"));
            return;
        }
    }

    // --- SQL ---
    let sql = `SELECT ${selectFields.join(", ")}\nFROM "${baseTable}"`;
    joins.forEach(join => sql += `\nJOIN "${join.table}" ON ${join.condition}`);
    if (whereClauses.length) sql += `\nWHERE ${whereClauses.join(" AND ")}`;
    if (groupByFields.length) sql += `\nGROUP BY ${groupByFields.join(", ")}`;
    if (orderByClauses.length) sql += `\nORDER BY ${orderByClauses.join(", ")}`;

    // --- save query ---
    const queryDefinition = { name: queryName, baseTable: baseTable, config: queryConfig, joins, sql };
    const existingQueryIndex = queries.definitions.findIndex(q => q.name === queryName);
    if (existingQueryIndex !== -1) queries.definitions[existingQueryIndex] = queryDefinition;
    else queries.definitions.push(queryDefinition);
    saveDatabase();
    console.log("queryConfig=",queryDefinition )
    runSqlQuery(sql, queryName);
}

    let pendingQueryText = "";
    let pendingPlaceholders = [];
    let pendingQueryName = "";
    let currentPlaceholderIndex = 0;
    
    function showNextParameterPrompt() {
        if (currentPlaceholderIndex >= pendingPlaceholders.length) {
            runFinalSqlQuery();
            return;
        }
    
        const placeholder = pendingPlaceholders[currentPlaceholderIndex];
        document.getElementById("parameterPrompt").innerText = placeholder;
        document.getElementById("parameterInput").value = "";
        document.getElementById("parameterModal").style.display = "flex";
    }
    
    function confirmParameter() {
        const value = document.getElementById("parameterInput").value;
        const placeholder = pendingPlaceholders[currentPlaceholderIndex];
        const safeValue = `'${value.replace(/'/g, "''")}'`;
    
        pendingQueryText = pendingQueryText.replace(`[${placeholder}]`, safeValue);
        currentPlaceholderIndex++;
        document.getElementById("parameterModal").style.display = "none";
        showNextParameterPrompt();
    }
    
    function cancelParameter() {
        document.getElementById("parameterModal").style.display = "none";
        Message(t("queryCancelled"));
    }
    


/**
 * Виконати користувацький SQL-запит
 **/
function executeOwnSQL() {
    sqlQuery = document.getElementById("ownSqlInput").value.trim();
    queryName = document.getElementById("ownSQLName").value.trim();
    if (!saveOwnSQLquery()) {
        Message(t("queryNotSaved"))
        }
    isOwnSQL = true;
    runSqlQuery(sqlQuery, queryName);
    
}    

function runSqlQuery(sqlQuery, queryName) {
    pendingQueryName = queryName;
    console.log("runSqlQuery")
    const matches = [...sqlQuery.matchAll(/\[([^\]]+)\]/g)];
    const uniquePlaceholders = [...new Set(matches.map(m => m[1]))];
    
    if (uniquePlaceholders.length > 0) {
            pendingQueryText = sqlQuery;
            pendingPlaceholders = uniquePlaceholders;
            currentPlaceholderIndex = 0;
            showNextParameterPrompt();
        } else {
            pendingQueryText = sqlQuery;
            runFinalSqlQuery();
        }
    }

function updateDatabaseTables() {
    // Очистимо список, щоб не дублювати
    database.tables = [];

    const res = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table';");
    if (res.length > 0) {
        const tableRows = res[0].values;
        tableRows.forEach(([name]) => {
            if (name.startsWith("sqlite_")) return;

            const pragmaRes = db.exec(`PRAGMA table_info("${name}")`);
            if (!pragmaRes.length) return;

            const columns = pragmaRes[0].values;

            // Зчитуємо зовнішні ключі
            const fkRes = db.exec(`PRAGMA foreign_key_list("${name}")`);
            const foreignKeys = fkRes.length ? fkRes[0].values.map(([id, seq, refTable, fromCol, toCol]) => ({
                fromCol, refTable, toCol
            })) : [];

            // Формуємо схему
            const schema = columns.map(([cid, title, type, notnull, dflt_value, pk]) => {
                const fk = foreignKeys.find(f => f.fromCol === title);
                return {
                    title,
                    type: type.toUpperCase() === "INTEGER" ? "Ціле число"
                        : type.toUpperCase() === "REAL" ? "Дробове число"
                        : type.toUpperCase().includes("TEXT") ? "Текст"
                        : type.toUpperCase().includes("BOOL") ? "Так/Ні"
                        : type,
                    primaryKey: pk > 0,
                    comment: pk > 0 ? "Первинний ключ" : "",
                    foreignKey: !!fk,
                    refTable: fk ? fk.refTable : null,
                    refField: fk ? fk.toCol : null
                };
            });

            // Зчитуємо дані
            const selectRes = db.exec(`SELECT * FROM "${name}"`);
            const dataRows = selectRes.length ? selectRes[0].values : [];

            database.tables.push({
                name: name,
                schema: schema,
                data: dataRows
            });
        });
    }
}

function runFinalSqlQuery() {
    const internalQueryName = `запит "${pendingQueryName}"`;
    const menuDisplayName = `*${internalQueryName}`;

    try {
        const isAggregateQuery = /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(pendingQueryText);
        const res = db.exec(pendingQueryText); 
        
        if (isOwnSQL) { // оновимо про всяк випадок таблиці та їх структури якщо запит "вручну"
                    updateDatabaseTables();
                    isOwnSQL = false;
        }
        
        if (res.length > 0) {
            const columns = res[0].columns;
            const dataRows = res[0].values;

            const schema = columns.map(col => ({
                title: col,
                type: "Текст",
                primaryKey: false,
                comment: ""
            }));

            const queryResultTable = {
                name: internalQueryName,
                schema: schema,
                data: dataRows
            };

            const existingIndex = queries.results.findIndex(t => t.name === internalQueryName);
            if (existingIndex !== -1) {
                queries.results[existingIndex] = queryResultTable;
                const dataMenu = document.getElementById("data-menu");
                const existingItem = Array.from(dataMenu.children).find(item => item.textContent === menuDisplayName);
                if (existingItem) existingItem.remove();
            } else {
                queries.results.push(queryResultTable);
            }
            
            addTableToMenu(menuDisplayName);

            closeOwnSqlModal();
            editData(menuDisplayName);
        } else {
            Message(t("queryEmptyResult"));
        }
        updateQuickAccessPanel(
                  getCurrentTableNames(),
                  getCurrentQueryNames(),
                  getCurrentReportNames(),
                  getCurrentFormNames()
                );  
    } catch (e) {
        Message(t("queryRunError", e.message));
    }
    

}

// Functions for managing saved queries
function showSavedQueriesDialog() {
        const listEl = document.getElementById("savedQueriesList");
        listEl.innerHTML = "";
        selectedQueryName = null;

        queries.definitions.forEach(query => {
            const li = document.createElement("li");
            li.textContent = query.name;
            li.style.padding = "8px";
            li.style.cursor = "pointer";
            li.dataset.queryName = query.name; // Store the query name in a data attribute

            li.addEventListener("click", () => {
                [...listEl.children].forEach(el => el.style.background = "");
                const isDark = document.body.classList.contains("dark-theme");
                li.style.background = isDark ? "#242d43" : "#d0e0ff";
                selectedQueryName = li.dataset.queryName;
            });
            listEl.appendChild(li);
        });
        document.getElementById("savedQueriesModal").style.display = "flex";
}

function closeSavedQueriesDialog() {
        document.getElementById("savedQueriesModal").style.display = "none";
        selectedQueryName = null;
}
    
function editSelectedQuery() {
        if (!selectedQueryName) {
            Message(t("querySelectForEdit"));
            return;
        }
    
        const queryToEdit = queries.definitions.find(q => q.name === selectedQueryName);
        console.log("Edit query=",selectedQueryName, queryToEdit )
        if (queryToEdit) {
            if (queryToEdit.config === null && queryToEdit.joins === null) {
                // Власний SQL-запит
                editOwnQuery(queryToEdit);
            } else {
                populateQueryModal(queryToEdit);
                // Згенерований конструктором запит
            }
            closeSavedQueriesDialog();
        } else {
            Message(t("queryNotFound"));
        }
}
    
function executeSelectedQuery() {
        if (!selectedQueryName) {
            Message(t("querySelectForRun"));
            return;
        }
    
        const queryDef = queries.definitions.find(q => q.name === selectedQueryName);
        if (!queryDef) {
            Message(t("queryNotFound"));
            return;
        }
    
        closeSavedQueriesDialog();
        runSqlQuery(queryDef.sql, queryDef.name);
}
function onFromTableChange() {
    const tableName = document.getElementById("fromTable").value;
    if (tableName) {
        // Очистити поточні рядки
        document.getElementById("queryBody").innerHTML = "";
        // Додати новий рядок
        addQueryRow();
        // Встановити таблицю в цьому рядку
        const newRow = document.querySelector("#queryBody tr");
        if (newRow) {
            const tableSelect = newRow.querySelector(".query-table-select");
            tableSelect.value = tableName;
            populateFieldDropdown(tableSelect); // тепер це безпечно!
        }
    }
}
function populateQueryModal(queryDefinition) {
    document.getElementById("queryName").value = queryDefinition.name;
    const queryBody = document.getElementById("queryBody");
    queryBody.innerHTML = ""; // Очистити рядки полів
    document.getElementById("joinBody").querySelector("tbody").innerHTML = ""; // Очистити зв’язки
    toggleStructureButtonVisibility(true);
    resetNonReadonlyRelations(); 
    // Відновлення рядків полів
    queryDefinition.config.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><select class="query-table-select" onchange="onFromTableChange()"></select></td>
            <td><select class="query-field-select"></select></td>
            <td><input type="checkbox" checked class="query-visible-checkbox"></td>
            <td>
                <select class="query-sort-select">
                    <option value="">${t("sortNone")}</option>
                    <option value="ASC">${t("sortAsc")}</option>
                    <option value="DESC">${t("sortDesc")}</option>
                </select>
            </td>
            <td>
                <div style="display: flex; gap: 4px; align-items: center;">
                <select class="query-operator-select" style="width: 60px;">
                    <option ${t("opEqual") ? `title="${t("opEqual")}"` : ""} value="==">==</option>
                    <option ${t("opLess") ? `title="${t("opLess")}"` : ""} value="<">&lt;</option>
                    <option ${t("opLessEq") ? `title="${t("opLessEq")}"` : ""} value="<=">&lt;=</option>
                    <option ${t("opGreater") ? `title="${t("opGreater")}"` : ""} value=">">&gt;</option>
                    <option ${t("opGreaterEq") ? `title="${t("opGreaterEq")}"` : ""} value=">=">&gt;=</option>
                    <option ${t("opNotEq") ? `title="${t("opNotEq")}"` : ""} value="!=">!=</option>
                    <option ${t("opLike") ? `title="${t("opLike")}"` : ""} value="LIKE">LIKE</option>
                    <option ${t("opIn") ? `title="${t("opIn")}"` : ""} value="IN">IN</option>
                    <option ${t("opNotIn") ? `title="${t("opNotIn")}"` : ""} value="NOT IN">NOT IN</option>
                    <option ${t("opBetween") ? `title="${t("opBetween")}"` : ""} value="BETWEEN">BETWEEN</option>
                    <option ${t("opNotBetween") ? `title="${t("opNotBetween")}"` : ""} value="NOT BETWEEN">NOT BETWEEN</option>
                </select>
                    <input type="text" class="query-criteria-input" style="flex: 1;">
                </div>
            </td>
            <td>
                <select class="query-field-role" ${`title="${t("roleParticipation")}"`} onchange="toggleAliasInput(this)">
                    <option value="select">----</option>                    
                    <option ${`title="${t("roleCount")}"`} value="count">COUNT</option>
                    <option ${`title="${t("roleSum")}"`} value="sum">SUM</option>
                    <option ${`title="${t("roleAvg")}"`} value="avg">AVG</option>
                    <option ${`title="${t("roleMin")}"`} value="min">MIN</option>
                    <option ${`title="${t("roleMax")}"`} value="max">MAX</option>
                </select>
                <input type="text" class="query-alias-input" ${`placeholder="${t("queryAliasFull")}"`} style="margin-top:4px; display:none; width:100%;">
            </td>
            <td><select class="group-field-select"></select></td>
            <td><button onclick="deleteQueryRow(this)">❌</button></td>
        `;
        queryBody.appendChild(row);

        // Заповнити випадаючі списки
        populateTableDropdownsForRow(row);
        row.querySelector(".query-table-select").value = item.tableName;
        populateFieldDropdown(row.querySelector(".query-table-select"));
        row.querySelector(".query-field-select").value = item.fieldName;
        row.querySelector(".group-field-select").value = item.groupName;
        row.querySelector(".query-visible-checkbox").checked = item.isVisible;
        row.querySelector(".query-sort-select").value = item.sortBy;

        const operatorSelect = row.querySelector(".query-operator-select");
        const criteriaInput = row.querySelector(".query-criteria-input");

        // Встановлюємо оператор і критерій

        operatorSelect.value = item.operator;
        criteriaInput.value = item.criteria;

        // Встановлюємо роль поля (важливо!)
        const roleSelect = row.querySelector(".query-field-role");
        roleSelect.value = item.fieldRole || "select";     
        
        // Встановлюємо псевдонім, якщо він був
        const aliasInput = row.querySelector(".query-alias-input");
        if (item.alias) {
            aliasInput.value = item.alias;
        }

        // Оновлюємо видимість інпуту псевдоніма
        toggleAliasInput(roleSelect);
        
        
    });

    // Відновлення JOIN-зв’язків
    if (queryDefinition.joins && queryDefinition.joins.length > 0) {
        const joinTable = document.getElementById("joinBody");
        const tbody = joinTable.querySelector("tbody");
        joinTable.style.display = "table";

        queryDefinition.joins.forEach(join => {
            const match = join.condition.match(/"([^"]+)"\."([^"]+)" = "([^"]+)"\."([^"]+)"/);
            if (!match) return;

            const [, tableA, fieldA, tableB, fieldB] = match;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><select class="join-table-a" onchange="populateJoinFields(this, true)"></select></td>
                <td><select class="join-field-a"></select></td>
                <td><select class="join-table-b" onchange="populateJoinFields(this, false)"></select></td>
                <td><select class="join-field-b"></select></td>
                <td><button onclick="this.closest('tr').remove()">❌</button></td>
            `;
            tbody.appendChild(row);

            const tableSelectA = row.querySelector(".join-table-a");
            const tableSelectB = row.querySelector(".join-table-b");
            const fieldSelectA = row.querySelector(".join-field-a");
            const fieldSelectB = row.querySelector(".join-field-b");

            [tableSelectA, tableSelectB].forEach(select => {
                select.innerHTML = "<option value=''>" + t("querySelectTable") + "</option>";
                database.tables.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.name;
                    opt.textContent = t.name;
                    select.appendChild(opt);
                });
            });

            tableSelectA.value = tableA;
            tableSelectB.value = tableB;

            populateJoinFields(tableSelectA, true);
            populateJoinFields(tableSelectB, false);

            fieldSelectA.value = fieldA;
            fieldSelectB.value = fieldB;
        });
    }

    // Відновлення базової таблиці (FROM)
    const fromTableSelect = document.getElementById("fromTable");
    if (fromTableSelect) {
        // Спочатку очистити і заповнити варіанти
        fromTableSelect.innerHTML = "<option value=''>" + t("querySelectTable") + "</option>";
        database.tables.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.name;
            opt.textContent = t.name;
            fromTableSelect.appendChild(opt);
        });
    
        // Встановити значення, якщо воно є
        fromTableSelect.value = queryDefinition.baseTable || "";
    }
    document.getElementById("queryModal").style.display = "flex";
}

function deleteSelectedQuery() {
        if (!selectedQueryName) {
            Message(t("querySelectForDelete"));
            return;
        }
        const queryIndex = queries.definitions.findIndex(q => q.name === selectedQueryName);
        if (queryIndex !== -1) {
            const deletedQueryName = queries.definitions[queryIndex].name;
            queries.definitions.splice(queryIndex, 1); // Remove from definitions
            saveDatabase(); // Save updated definitions

            // Also remove any corresponding query results from `queries.results` and from the `data-menu`
            const menuDisplayName = `*запит "${deletedQueryName}"`; // Construct the display name for the result
            const resultIndex = queries.results.findIndex(r => r.name === `запит "${deletedQueryName}"`); // Find the result by its internal name
            if (resultIndex !== -1) {
                queries.results.splice(resultIndex, 1); // Remove from results
            }

            const dataMenu = document.getElementById("data-menu");
            const existingMenuItem = Array.from(dataMenu.children).find(item => item.textContent === menuDisplayName);
            if (existingMenuItem) {
                existingMenuItem.remove(); // Remove from menu
            }

            Message(t("queryDeleted", deletedQueryName));
            showSavedQueriesDialog(); // Refresh the list
        } else {
            Message(t("queryNotFound"));
        }
    }

function addJoinRow() {
        const joinTable = document.getElementById("joinBody");
        const tbody = joinTable.querySelector("tbody");

        joinTable.style.display = "table"; // Показує таблицю, якщо прихована

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><select class="join-table-a" onchange="populateJoinFields(this, true)"></select></td>
            <td><select class="join-field-a"></select></td>
            <td><select class="join-table-b" onchange="populateJoinFields(this, false)"></select></td>
            <td><select class="join-field-b"></select></td>
            <td><button onclick="this.closest('tr').remove()">❌</button></td>
        `;
        tbody.appendChild(row);

        const selects = row.querySelectorAll("select");
        selects.forEach(select => {
            if (select.classList.contains("join-table-a") || select.classList.contains("join-table-b")) {
                select.innerHTML = "<option value=''>" + t("querySelectTable") + "</option>";
                database.tables.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.name;
                    opt.textContent = t.name;
                    select.appendChild(opt);
                });
            }
        });
    }

function populateJoinFields(tableSelect, isLeft) {
        const row = tableSelect.closest("tr");
        const fieldSelect = isLeft ? row.querySelector(".join-field-a") : row.querySelector(".join-field-b");
        fieldSelect.innerHTML = "";

        const table = database.tables.find(t => t.name === tableSelect.value);
        if (table) {
            table.schema.forEach(field => {
                const opt = document.createElement("option");
                opt.value = field.title;
                opt.textContent = field.title;
                fieldSelect.appendChild(opt);
            });
        }
    }

function openRelationFromQuery() {
        const joinRows = document.querySelectorAll("#joinBody tbody tr");
        database.relations = [];

        joinRows.forEach(row => {
            const tableA = row.querySelector(".join-table-a")?.value;
            const fieldA = row.querySelector(".join-field-a")?.value;
            const tableB = row.querySelector(".join-table-b")?.value;
            const fieldB = row.querySelector(".join-field-b")?.value;

            if (tableA && fieldA && tableB && fieldB) {
                database.relations.push({
                    fromTable: tableA,
                    fromField: fieldA,
                    toTable: tableB,
                    toField: fieldB
                });
            }
        });

        //saveDatabase();
        openRelationDesigner(() => {
            // callback після закриття конструктора — синхронізуємо з JOIN
            loadRelationsToJoinTable();
        });
}

// Ручне створення SQL-запиту
// Відкриває модальне вікно для ручного введення та виконання SQL-запитів.
function createOwnSQL() {
		if(!isDBExist()) return
        document.getElementById("ownSqlInput").value = ""; // Очистити поле вводу
        document.getElementById("ownSqlResults").innerHTML = ""; // Очистити результати попередніх запитів
        document.getElementById("ownSqlModal").style.display = "flex";
        document.getElementById('ownSQLName').value = t("queryNewQuery");
        toggleStructureButtonVisibility(true);
    }
    
function editOwnQuery(query) {
        // Відкриваємо модальне вікно власного SQL
        const modal = document.getElementById("ownSqlModal");
        if (modal) modal.style.display = "flex";
        toggleStructureButtonVisibility(true)
        
    
        // Вставляємо назву запиту
        const nameInput = document.getElementById("ownSQLName");
        if (nameInput) nameInput.value = query.name || "";
    
        // Вставляємо текст SQL-запиту
        const sqlTextarea = document.getElementById("ownSqlInput");
        if (sqlTextarea) sqlTextarea.value = query.sql || "";
        
        document.getElementById("ownSqlResults").innerHTML = ""; // Очистити результати попередніх запитів
}
       
    
function saveOwnSQLquery() {
        const sql = document.getElementById("ownSqlInput").value.trim();
        const name = document.getElementById("ownSQLName")?.value.trim();
    
        if (!sql) {
            Message(t("queryEmptySQL"));
            return false;
        }
    
        if (!name) {
            Message(t("queryNoName2"));
            return false;
        }
    
        // Формуємо об'єкт запиту
        const query = {
            name: name,
            sql: sql,
            config: null,
            joins: null
        };
    
        // Шукаємо, чи існує вже такий запит
        const existingIndex = queries.definitions.findIndex(q => q.name === name);
    
        if (existingIndex !== -1) {
            if (!confirm("Запит з таким ім’ям вже існує. Перезаписати?")) return false;
            queries.definitions[existingIndex] = query;
        } else {
            queries.definitions.push(query);
        }
    
        saveDatabase();
        return true
}

function saveOwnSQL() {
        if (saveOwnSQLquery()) {
            Message(t("querySaved"));
        }    
}
