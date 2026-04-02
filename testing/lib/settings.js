// ========== НАЛАШТУВАННЯ ==========
// Ключі для зберігання в localStorage
const SETTINGS_KEYS = {
    AUTO_LOAD_LAST_DB: 'app_settings_autoLoadLastDb',
    SIMPLE_INTERFACE: 'app_settings_simpleInterface',
    DARK_THEME: 'app_settings_darkTheme',
    LANGUAGE: 'app_settings_language'
};
// Функція для завантаження налаштувань при старті
function loadSettings() {
    // Автозавантаження останньої БД
    const autoLoad = localStorage.getItem(SETTINGS_KEYS.AUTO_LOAD_LAST_DB);
    if (autoLoad === null) {
        // За замовчуванням true, якщо ключ не існує
        localStorage.setItem(SETTINGS_KEYS.AUTO_LOAD_LAST_DB, 'true');
        document.getElementById('autoLoadLastDbCheckbox').checked = true;
    } else {
        document.getElementById('autoLoadLastDbCheckbox').checked = autoLoad === 'true';
    }
    // Простий інтерфейс (приховування панелі швидкого доступу)
    const simpleInterface = localStorage.getItem(SETTINGS_KEYS.SIMPLE_INTERFACE);
    if (simpleInterface === null) {
        localStorage.setItem(SETTINGS_KEYS.SIMPLE_INTERFACE, 'false');
        document.getElementById('simpleInterfaceCheckbox').checked = false;
    } else {
        document.getElementById('simpleInterfaceCheckbox').checked = simpleInterface === 'true';
    }
    applySimpleInterface(document.getElementById('simpleInterfaceCheckbox').checked);
    // Темна тема
    const darkTheme = localStorage.getItem(SETTINGS_KEYS.DARK_THEME);
    if (darkTheme === null) {
        localStorage.setItem(SETTINGS_KEYS.DARK_THEME, 'false');
        document.getElementById('darkThemeCheckbox').checked = false;
    } else {
        document.getElementById('darkThemeCheckbox').checked = darkTheme === 'true';
    }
    applyDarkTheme(document.getElementById('darkThemeCheckbox').checked);
    // Мова
    const language = localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || DEFAULT_LANG;
    document.getElementById('languageSelect').value = language;
    // loadLanguage вже викликається через DOMContentLoaded в i18n-ініціалізації,
    // тут лише синхронізуємо select із збереженим значенням.
}
// Застосування простого інтерфейсу
function applySimpleInterface(enabled) {
    const mMenu = document.getElementById('quickAccessPanel');
    if (mMenu) {
        document.addEventListener('DOMContentLoaded', () => {
            openMainMenu();
            console.log("openMainMenu");
        });
        closeSettingsModal();
    }
    // Зберігаємо стан
    localStorage.setItem(SETTINGS_KEYS.SIMPLE_INTERFACE, enabled);
}
// Застосування темної теми
function applyDarkTheme(enabled) {
    if (enabled) {
        // Додаємо клас dark-theme до body для стилізації модальних вікон
        document.body.classList.add('dark-theme');
        // Додаємо стилі темної теми
        const styleId = 'dark-theme-style';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
            /* Загальні стилі темної теми */
            body.dark-theme {
                background-color: #1e1e1e;
                color: #e0e0e0;
            }
            body.dark-theme .menu-bar {
                background-color: #2d2d2d;
                border-bottom: 1px solid #444;
            }
            body.dark-theme .menu-item > span, 
            body.dark-theme .menu-item {
                color: #e0e0e0;
            }
            body.dark-theme .dropdown {
                background-color: #2d2d2d;
                border: 1px solid #444;
            }
            body.dark-theme .dropdown a {
                color: #e0e0e0;
            }
            body.dark-theme .dropdown a:hover {
                background-color: #3e3e3e;
            }
            body.dark-theme .title-bar {
                background-color: #2d2d2d;
                color: #e0e0e0;
            }
            body.dark-theme input, 
            body.dark-theme select, 
            body.dark-theme textarea, 
            body.dark-theme button {
                background-color: #333;
                color: #e0e0e0;
                border-color: #555;
            }
            
            /* Стилі для списків та виділених елементів */
            body.dark-theme ul {
                background-color: #2d2d2d;
            }
            
            body.dark-theme li {
                background-color: #2d2d2d;
                color: #e0e0e0;
                padding: 8px 12px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            body.dark-theme li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для виділеного елемента в списках */
            body.dark-theme li.selected,
            body.dark-theme .selected-item,
            body.dark-theme .list-item.selected,
            body.dark-theme #storageList li.selected,
            body.dark-theme #savedQueriesList li.selected,
            body.dark-theme #savedTablesList li.selected,
            body.dark-theme #reportList li.selected,
            body.dark-theme #savedFormsList li.selected,
            body.dark-theme #dataWorkList li.selected {
                background-color: #4a9eff !important;
                color: white !important;
                border-left: 3px solid #ffaa00;
            }
            
            /* Стилі для списку збережених баз даних */
            body.dark-theme #storageList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #storageList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для списку збережених таблиць */
            body.dark-theme #savedTablesList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #savedTablesList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для списку збережених запитів */
            body.dark-theme #savedQueriesList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #savedQueriesList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для списку звітів */
            body.dark-theme #reportList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #reportList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для списку форм */
            body.dark-theme #savedFormsList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #savedFormsList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для списку даних */
            body.dark-theme #dataWorkList li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #dataWorkList li:hover {
                background-color: #3a3a3a;
            }
            
            /* Стилі для таблиці вибору таблиць */
            body.dark-theme #tableListInModal li {
                background-color: #2d2d2d;
                border-bottom: 1px solid #3a3a3a;
                padding: 10px;
            }
            
            body.dark-theme #tableListInModal li:hover {
                background-color: #3a3a3a;
            }
            
            body.dark-theme #tableListInModal li.selected {
                background-color: #4a9eff !important;
                color: white !important;
            }
            
            /* Стилі для всіх таблиць */
            body.dark-theme table {
                background-color: #252525;
                color: #e0e0e0;
                border-color: #444;
            }
            
            /* Стилі для заголовків таблиць */
            body.dark-theme th,
            body.dark-theme thead th,
            body.dark-theme .query-table th,
            body.dark-theme #schemaTable th,
            body.dark-theme #editTable th,
            body.dark-theme #dataViewTable th,
            body.dark-theme #editHead th,
            body.dark-theme #dataViewHead th,
            body.dark-theme .table-header {
                background-color: #3a3a3a !important;
                color: #e0e0e0 !important;
                border-color: #555 !important;
                font-weight: bold;
            }
            
            /* Стилі для комірок таблиць */
            body.dark-theme td,
            body.dark-theme tbody td,
            body.dark-theme .query-table td,
            body.dark-theme #schemaTable td,
            body.dark-theme #editTable td,
            body.dark-theme #dataViewTable td,
            body.dark-theme #editBody td,
            body.dark-theme #dataViewBody td {
                background-color: #2d2d2d;
                color: #e0e0e0;
                border-color: #444;
            }
            
            /* Спеціальні стилі для комірок з класом pk */
            body.dark-theme th.pk,
            body.dark-theme td.pk {
                background-color: #4a4a4a !important;
                color: #e0e0e0 !important;
            }
            
            /* Стилі для модальних вікон у темній темі */
            body.dark-theme #modal > div,
            body.dark-theme #dbModal > div,
            body.dark-theme #editModal > div,
            body.dark-theme #queryModal > div,
            body.dark-theme #reportCreatorModal > div,
            body.dark-theme #formCreatorModal > div,
            body.dark-theme #settingsModal > div,
            body.dark-theme #messageModal > div,
            body.dark-theme #storageModal > div,
            body.dark-theme #deleteModal > div,
            body.dark-theme #overwriteModal > div,
            body.dark-theme #savedQueriesModal > div,
            body.dark-theme #savedTablesModal > div,
            body.dark-theme #reportListModal > div,
            body.dark-theme #savedFormsModal > div,
            body.dark-theme #ownSqlModal > div,
            body.dark-theme #aboutModal > div,
            body.dark-theme #dataModal > div,
            body.dark-theme #dataWorkModal > div,
            body.dark-theme #dataViewModal > div,
            body.dark-theme #csvImportModal > div,
            body.dark-theme #importTableModal > div,
            body.dark-theme #confirmImportModal > div,
            body.dark-theme #fieldSelectionModal > div,
            body.dark-theme .modal-content,
            body.dark-theme [id$="Modal"] > div:not(.alert-modal-content) {
                background-color: #2d2d2d !important;
                color: #e0e0e0 !important;
                border-color: #444 !important;
            }
            
            /* Стилі для relationCanvas */
            body.dark-theme #relationCanvas {
                background-color: #2a2a2a !important;
                border: 1px solid #444 !important;
                position: relative;
            }
            
            /* Стилі для SVG ліній на relationCanvas */
            body.dark-theme #relationCanvas svg {
                background-color: transparent;
            }
            
            body.dark-theme #relationCanvas svg line {
                stroke: #888 !important;
            }
            
            body.dark-theme #relationCanvas svg text {
                fill: #e0e0e0 !important;
            }
            
            /* Стилі для таблиць на relationCanvas */
            body.dark-theme .relation-table {
                background-color: #2d2d2d !important;
                border: 1px solid #555 !important;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            }
            
            body.dark-theme .relation-table .table-header {
                background-color: #3a3a3a !important;
                color: #e0e0e0 !important;
                padding: 8px;
                border-bottom: 1px solid #555;
                cursor: move;
            }
            
            body.dark-theme .relation-table .table-fields {
                padding: 5px;
            }
            
            body.dark-theme .relation-table .field-item {
                padding: 4px 8px;
                margin: 2px 0;
                cursor: pointer;
                border-radius: 3px;
                color: #e0e0e0;
            }
            
            body.dark-theme .relation-table .field-item:hover {
                background-color: #3a5a7a;
            }
            
            body.dark-theme .relation-table .field-item.pk-field {
                color: #4a9eff;
                font-weight: bold;
            }
            
            body.dark-theme .relation-table .field-item.fk-field {
                color: #6a9eff;
            }
            
            /* Стилі для structurePanel */
            body.dark-theme #structurePanel {
                background-color: #2d2d2d !important;
                border-left: 1px solid #444 !important;
                box-shadow: -2px 0 5px rgba(0,0,0,0.3);
            }
            
            body.dark-theme #structurePanel > div:first-child {
                background-color: #3a3a3a !important;
                color: #e0e0e0 !important;
                border-bottom: 1px solid #555;
            }
            
            body.dark-theme #structureContent {
                background-color: #2d2d2d;
                color: #e0e0e0;
            }
            
            body.dark-theme .db-table {
                border-bottom: 1px solid #444 !important;
                margin-bottom: 12px;
            }
            
            body.dark-theme .db-table .table-header {
                color: #4a9eff !important;
                cursor: pointer;
                padding: 8px;
                background-color: #3a3a3a;
                border-radius: 4px;
            }
            
            body.dark-theme .db-table .table-header:hover {
                background-color: #4a4a4a;
            }
            
            body.dark-theme .db-field {
                padding: 6px 8px;
                border-bottom: 1px solid #3a3a3a;
                color: #c0c0c0;
            }
            
            body.dark-theme .db-field:hover {
                background-color: #3a3a3a;
            }
            
            body.dark-theme .db-field .field-name {
                color: #e0e0e0;
                cursor: pointer;
            }
            
            body.dark-theme .db-field .field-name:hover {
                color: #4a9eff;
            }
            
            body.dark-theme .db-field small {
                color: #888 !important;
            }
            
            /* Стилі для reportCanvas та formCanvas */
            body.dark-theme #reportCanvas,
            body.dark-theme #formCanvas,
            body.dark-theme #reportPreviewCanvas {
                background-color: #2a2a2a !important;
                border-color: #444 !important;
                border: 1px solid #555 !important;
            }
            
            /* Стилі для елементів на canvas (звіти та форми) */
            body.dark-theme .report-element,
            body.dark-theme .form-element {
                border-color: #666 !important;
                background-color: rgba(60, 60, 60, 0.8) !important;
            }
            
            body.dark-theme .report-element .field-text,
            body.dark-theme .form-element .field-text {
                color: #e0e0e0 !important;
            }
            
            body.dark-theme .report-element.selected,
            body.dark-theme .form-element.selected {
                border: 2px solid #4a9eff !important;
            }
            
            /* Стилі для сітки на canvas */
            body.dark-theme #reportCanvas.grid-visible {
                background-image:
                    repeating-linear-gradient(0deg, #555 0, #555 1px, transparent 1px, transparent 19px, #555 19px, #555 20px),
                    repeating-linear-gradient(90deg, #555 0, #555 1px, transparent 1px, transparent 19px, #555 19px, #555 20px) !important;
                background-size: 20px 20px !important;
            }
            
            /* Спеціально для alert-modal-content (повідомлення з червоною рамкою) */
            body.dark-theme .alert-modal-content {
                background-color: #3a2a2a !important;
                color: #e0e0e0 !important;
                border: 3px solid #ff5555 !important;
            }
            
            /* Стилі для контенту всередині модальних вікон */
            body.dark-theme .modal-content h2,
            body.dark-theme .modal-content h3,
            body.dark-theme [id$="Modal"] h2,
            body.dark-theme [id$="Modal"] h3,
            body.dark-theme [id$="Modal"] label {
                color: #e0e0e0 !important;
            }
            
            body.dark-theme .quick-icon {
                background-color: #3a3a3a;
                border-color: #555;
            }
            
            body.dark-theme .resize-handle {
                background-color: #888;
            }
            
            body.dark-theme .report-label, 
            body.dark-theme .form-label {
                border-color: #888 !important;
                background-color: rgba(100,100,100,0.5) !important;
            }
            
            body.dark-theme .report-field, 
            body.dark-theme .form-field {
                border-color: #2c6e2c !important;
                background-color: rgba(40,80,40,0.3) !important;
            }
            
            /* Стилі для кнопок */
            body.dark-theme button.square-btn {
                background-color: #3a3a3a;
                border-color: #555;
                color: #e0e0e0;
            }
            
            body.dark-theme button.square-btn:hover {
                background-color: #4a4a4a;
            }
            
            /* Стилі для select та input */
            body.dark-theme select option {
                background-color: #333;
                color: #e0e0e0;
            }
            
            /* Стилі для details/summary */
            body.dark-theme details {
                color: #e0e0e0;
            }
            
            body.dark-theme details pre {
                background-color: #1e1e1e !important;
                color: #e0e0e0 !important;
            }
            
            /* Стилі для фільтрів та пошуку */
            body.dark-theme #dataFilterCondition1,
            body.dark-theme #dataFilterCondition2,
            body.dark-theme #logicalOperator,
            body.dark-theme #dataFieldSelect {
                background-color: #333;
                color: #e0e0e0;
                border-color: #555;
            }
            
            /* Стилі для radio buttons */
            body.dark-theme input[type="radio"] {
                accent-color: #4a9eff;
            }
            
            /* Стилі для виділених рядків */
            body.dark-theme .selected-row {
                outline: 2px solid #4a9eff;
                outline-offset: -2px;
            }
            
            body.dark-theme td.selected {
                background-color: #3a5a7a !important;
                border: 2px solid #4a9eff !important;
            }
            
            /* Стилі для тексту в полях звітів та форм при редагуванні */
            body.dark-theme [contenteditable="true"] {
                color: #e0e0e0;
                background-color: #3a3a3a;
            }
            
            /* Стилі для модального вікна редагування тексту */
            body.dark-theme #editLabelModal > div {
                background-color: #2d2d2d !important;
                border-color: #444 !important;
            }
            
            body.dark-theme #editInput {
                background-color: #333;
                color: #e0e0e0;
                border-color: #555;
            }
            
            /* Стилі для скролбарів */
            body.dark-theme ::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            
            body.dark-theme ::-webkit-scrollbar-track {
                background: #2d2d2d;
            }
            
            body.dark-theme ::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 5px;
            }
            
            body.dark-theme ::-webkit-scrollbar-thumb:hover {
                background: #777;
            }
        `;
            document.head.appendChild(style);
        }
        // Примусово оновлюємо стилі для вже існуючих елементів
        const elementsToUpdate = ['reportCanvas', 'formCanvas', 'reportPreviewCanvas', 'relationCanvas', 'structurePanel', 'structureContent'];
        elementsToUpdate.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'relationCanvas') {
                    element.style.backgroundColor = '#2a2a2a';
                    element.style.border = '1px solid #444';
                } else if (id === 'structurePanel') {
                    element.style.backgroundColor = '#2d2d2d';
                    element.style.borderLeft = '1px solid #444';
                } else if (id === 'reportCanvas' || id === 'formCanvas' || id === 'reportPreviewCanvas') {
                    element.style.backgroundColor = '#2a2a2a';
                    element.style.borderColor = '#444';
                }
            }
        });
        // Оновлюємо виділені елементи в списках
        const listContainers = ['storageList', 'savedQueriesList', 'savedTablesList', 'reportList', 'savedFormsList', 'dataWorkList', 'tableListInModal'];
        listContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const selectedItems = container.querySelectorAll('li.selected');
                selectedItems.forEach(item => {
                    item.style.backgroundColor = '#4a9eff';
                    item.style.color = 'white';
                });
            }
        });
        // Оновлюємо SVG лінії, якщо вони є
        const relationCanvas = document.getElementById('relationCanvas');
        if (relationCanvas) {
            const svgLines = relationCanvas.querySelectorAll('svg line');
            svgLines.forEach(line => {
                line.style.stroke = '#888';
            });
            const svgTexts = relationCanvas.querySelectorAll('svg text');
            svgTexts.forEach(text => {
                text.style.fill = '#e0e0e0';
            });
        }
    } else {
        // Видаляємо клас dark-theme з body
        document.body.classList.remove('dark-theme');
        // Видаляємо стилі темної теми
        const style = document.getElementById('dark-theme-style');
        if (style) {
            style.remove();
        }
        // Відновлюємо оригінальні стилі для елементів
        const elementsToUpdate = ['reportCanvas', 'formCanvas', 'reportPreviewCanvas', 'relationCanvas', 'structurePanel', 'structureContent'];
        elementsToUpdate.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.backgroundColor = '';
                element.style.border = '';
                element.style.borderLeft = '';
                element.style.borderColor = '';
            }
        });
        // Відновлюємо виділені елементи в списках
        const listContainers = ['storageList', 'savedQueriesList', 'savedTablesList', 'reportList', 'savedFormsList', 'dataWorkList', 'tableListInModal'];
        listContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const selectedItems = container.querySelectorAll('li.selected');
                selectedItems.forEach(item => {
                    item.style.backgroundColor = '';
                    item.style.color = '';
                });
            }
        });
        // Відновлюємо SVG лінії
        const relationCanvas = document.getElementById('relationCanvas');
        if (relationCanvas) {
            const svgLines = relationCanvas.querySelectorAll('svg line');
            svgLines.forEach(line => {
                line.style.stroke = '';
            });
            const svgTexts = relationCanvas.querySelectorAll('svg text');
            svgTexts.forEach(text => {
                text.style.fill = '';
            });
        }
    }
    localStorage.setItem(SETTINGS_KEYS.DARK_THEME, enabled);
}
// Відкриття модального вікна налаштувань
function openSettingsModal() {
    // Оновлюємо значення checkbox'ів з поточних налаштувань
    document.getElementById('autoLoadLastDbCheckbox').checked = localStorage.getItem(SETTINGS_KEYS.AUTO_LOAD_LAST_DB) === 'true';
    document.getElementById('simpleInterfaceCheckbox').checked = localStorage.getItem(SETTINGS_KEYS.SIMPLE_INTERFACE) === 'true';
    document.getElementById('darkThemeCheckbox').checked = localStorage.getItem(SETTINGS_KEYS.DARK_THEME) === 'true';
    document.getElementById('languageSelect').value = localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || 'uk';
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

async function saveSettings() {
    const autoLoad = document.getElementById('autoLoadLastDbCheckbox').checked;
    const simpleInterface = document.getElementById('simpleInterfaceCheckbox').checked;
    const darkTheme = document.getElementById('darkThemeCheckbox').checked;
    const language = document.getElementById('languageSelect').value;
    // Зберігаємо налаштування
    localStorage.setItem(SETTINGS_KEYS.AUTO_LOAD_LAST_DB, autoLoad);
    localStorage.setItem(SETTINGS_KEYS.SIMPLE_INTERFACE, simpleInterface);
    localStorage.setItem(SETTINGS_KEYS.DARK_THEME, darkTheme);
    // Застосовуємо зміни
    applySimpleInterface(simpleInterface);
    applyDarkTheme(darkTheme);
    // Мова — застосовуємо "на льоту", без перезавантаження
    if (language !== (localStorage.getItem(SETTINGS_KEYS.LANGUAGE))) {
        await setLang(language);
        const langText = document.getElementById('languageSelect').options[document.getElementById('languageSelect').selectedIndex].text;
        Message(t("settingsLangChanged", langText));
    } else {
        Message(t("settingsSaved"));
    }
    closeSettingsModal();
}

function clearStorage() {
    if (confirm(t("settingsClearConfirm"))) {
        // Видаляємо всі ключі, пов'язані з базами даних
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.endsWith('.db-data') || key.endsWith('.tables-data') || key.endsWith('.queries-data') || key.endsWith('.query-results') || key.endsWith('.reports-data') || key.endsWith('.forms-data') || key.endsWith('.relations-data'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        // Видаляємо також з IndexedDB (опціонально)
        openAppDB().then(idb => {
            const tx = idb.transaction(IDB_STORE, 'readwrite');
            const store = tx.objectStore(IDB_STORE);
            store.clear();
            tx.oncomplete = () => console.log(t("settingsIndexedDbCleared"));
            tx.onerror = e => console.error(t("settingsIndexedDbClearError"), e);
        }).catch(e => console.error(t("settingsIndexedDbOpenError"), e));
        // Очищаємо поточну БД, якщо відкрита
        if (db) {
            db = null;
            clearDB();
            updateMainTitle();
            document.getElementById("import-table-link").style.display = "none";
        }
        localStorage.removeItem('lastOpenedFile');
        Message(t("settingsStorageCleared"));
        closeSettingsModal();
        // Оновлюємо сторінку для повного скидання
        setTimeout(() => location.reload(), 1500);
    }
}
// Модифікуємо початкове завантаження, щоб врахувати налаштування
const originalLoadDatabase = loadDatabase;
window.loadDatabase = async function() {
    await originalLoadDatabase();
    // Застосовуємо налаштування після завантаження БД
    applySimpleInterface(localStorage.getItem(SETTINGS_KEYS.SIMPLE_INTERFACE) === 'true');
    applyDarkTheme(localStorage.getItem(SETTINGS_KEYS.DARK_THEME) === 'true');
};
// Ініціалізація налаштувань після завантаження DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Спочатку завантажуємо мову (до loadSettings, щоб t() вже працював)
    const savedLang = localStorage.getItem(SETTINGS_KEYS.LANGUAGE) || DEFAULT_LANG;
    await loadLanguage(savedLang);
    // Завантажуємо решту налаштувань
    loadSettings();
    // Додаємо обробник для кнопки очищення сховища
    const clearBtn = document.getElementById('clearStorageBtn');
    if (clearBtn) {
        clearBtn.onclick = clearStorage;
    }
    // Додаємо обробник для кнопки збереження
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.onclick = saveSettings;
    }
});
