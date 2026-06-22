import {
  buildExportFilename,
  buildInputLabel,
  buildWorksheetRows,
  calcRowTotal,
  computeGrandTotal,
  createEmptyRow,
  formatMoney,
  normalizeRows,
  pickXlsx,
} from './core.js';

const STORAGE_KEY = 'payment-order-pwa.rows.v1';

const tableBody = document.querySelector('#tableBody');
const mobileList = document.querySelector('#mobileList');
const totalDisplay = document.querySelector('#totalDisplay');
const addRowBtn = document.querySelector('#addRowBtn');
const exportExcelBtn = document.querySelector('#exportExcelBtn');
const clearBtn = document.querySelector('#clearBtn');
const saveStatus = document.querySelector('#saveStatus');
const browserTip = document.querySelector('#browserTip');

let rowsData = loadRows();
let nextId = rowsData.length + 1;
let saveTimer = 0;

function loadRows() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [createEmptyRow(1), createEmptyRow(2)];
    return normalizeRows(JSON.parse(saved));
  } catch {
    return [createEmptyRow(1), createEmptyRow(2)];
  }
}

function persistRows() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
  saveStatus.textContent = '已自动保存';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveStatus.textContent = '本机保存中';
  }, 1800);
}

function updateRow(rowId, field, value) {
  const row = rowsData.find((item) => item.id === rowId);
  if (!row) return;
  row[field] = value;
  persistRows();
  updateTotals(rowId);
}

function addRow() {
  rowsData.push(createEmptyRow(nextId++));
  persistRows();
  render();
  window.setTimeout(() => {
    const newRow = document.querySelector(`[data-row-id="${rowsData.at(-1).id}"] input`);
    if (newRow) newRow.focus();
  }, 30);
}

function removeRow(rowId) {
  rowsData = normalizeRows(rowsData.filter((row) => row.id !== rowId));
  persistRows();
  render();
}

function clearRows() {
  const confirmed = window.confirm('确认清空当前货款单？此操作只清空本机保存的数据。');
  if (!confirmed) return;
  rowsData = [createEmptyRow(1), createEmptyRow(2)];
  nextId = 3;
  persistRows();
  render();
}

function inputFor(row, field, label, options = {}) {
  const input = document.createElement('input');
  input.className = 'cell-input';
  input.type = options.type || 'text';
  input.inputMode = options.inputMode || 'text';
  input.placeholder = options.placeholder || label;
  input.value = row[field] || '';
  input.setAttribute('aria-label', buildInputLabel(options.surface || '表单', label, row.id));
  input.dataset.rowId = row.id;
  input.dataset.field = field;
  if (options.readonly) {
    input.readOnly = true;
    input.value = formatMoney(calcRowTotal(row.quantity, row.price));
    input.dataset.field = 'total';
    return input;
  }
  if (options.min !== undefined) input.min = options.min;
  if (options.step !== undefined) input.step = options.step;
  input.addEventListener('input', (event) => updateRow(row.id, field, event.target.value));
  return input;
}

function removeButton(row) {
  const button = document.createElement('button');
  button.className = 'remove-button';
  button.type = 'button';
  button.title = '删除此行';
  button.setAttribute('aria-label', '删除此行');
  button.textContent = '×';
  button.addEventListener('click', () => removeRow(row.id));
  return button;
}

function renderDesktopRows() {
  tableBody.innerHTML = '';
  rowsData.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.dataset.rowId = row.id;

    const cells = [
      String(index + 1),
      inputFor(row, 'product', '产品名称', { surface: '桌面' }),
      inputFor(row, 'unit', '单位', { surface: '桌面' }),
      inputFor(row, 'quantity', '数量', { surface: '桌面', type: 'number', inputMode: 'decimal', min: '0', step: 'any', placeholder: '0' }),
      inputFor(row, 'price', '单价', { surface: '桌面', type: 'number', inputMode: 'decimal', min: '0', step: 'any', placeholder: '0.00' }),
      inputFor(row, 'total', '合价', { surface: '桌面', readonly: true }),
      removeButton(row),
    ];

    cells.forEach((content) => {
      const td = document.createElement('td');
      if (typeof content === 'string') td.textContent = content;
      else td.appendChild(content);
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

function renderMobileRows() {
  mobileList.innerHTML = '';
  rowsData.forEach((row, index) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.rowId = row.id;

    const head = document.createElement('div');
    head.className = 'card-head';
    const badge = document.createElement('span');
    badge.className = 'card-index';
    badge.textContent = String(index + 1);
    head.append(badge, removeButton(row));

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    [
      ['product', '产品', { full: true }],
      ['unit', '单位', {}],
      ['quantity', '数量', { type: 'number', inputMode: 'decimal', min: '0', step: 'any' }],
      ['price', '单价（元）', { type: 'number', inputMode: 'decimal', min: '0', step: 'any' }],
      ['total', '合价（元）', { readonly: true }],
    ].forEach(([field, label, options]) => {
      const wrapper = document.createElement('div');
      wrapper.className = options.full ? 'field full' : 'field';
      const text = document.createElement('label');
      text.textContent = label;
      wrapper.append(text, inputFor(row, field, label, { ...options, surface: '移动' }));
      grid.appendChild(wrapper);
    });

    card.append(head, grid);
    mobileList.appendChild(card);
  });
}

function updateTotals(rowId) {
  const row = rowsData.find((item) => item.id === rowId);
  if (row) {
    document.querySelectorAll(`input[data-row-id="${row.id}"][data-field="total"]`).forEach((input) => {
      input.value = formatMoney(calcRowTotal(row.quantity, row.price));
    });
  }
  totalDisplay.textContent = formatMoney(computeGrandTotal(rowsData));
}

function render() {
  rowsData = normalizeRows(rowsData);
  renderDesktopRows();
  renderMobileRows();
  totalDisplay.textContent = formatMoney(computeGrandTotal(rowsData));
}

function applyWorksheetStyle(workbookSheet, rowCount) {
  workbookSheet['!cols'] = [
    { wch: 8 },
    { wch: 24 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];
  workbookSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];
  workbookSheet['!rows'] = [{ hpt: 30 }, { hpt: 22 }, ...Array.from({ length: rowCount + 2 }, () => ({ hpt: 24 }))];
}

async function shareOrDownload(blob, filename) {
  const file = new File([blob], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: '产品货款单',
      text: '产品货款单 Excel 文件',
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

async function exportExcel() {
  const xlsx = getXlsx();
  if (!xlsx) {
    window.alert('Excel 导出组件未加载，请刷新页面后重试。');
    return;
  }

  const worksheetRows = buildWorksheetRows(rowsData);
  const worksheet = xlsx.utils.aoa_to_sheet(worksheetRows);
  applyWorksheetStyle(worksheet, rowsData.length);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, '产品货款单');
  const workbookArray = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([workbookArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  try {
    await shareOrDownload(blob, buildExportFilename());
    saveStatus.textContent = '已导出 Excel';
  } catch (error) {
    if (error.name !== 'AbortError') {
      window.alert('导出失败，请尝试使用 Safari 或电脑浏览器打开。');
    }
  }
}

function getXlsx() {
  const candidates = [
    window.XLSX,
    typeof XLSX !== 'undefined' ? XLSX : null,
    typeof exports !== 'undefined' ? exports : null,
    typeof module !== 'undefined' && module && module.exports ? module.exports : null,
    window.exports,
    window.module && window.module.exports,
    globalThis.XLSX,
    window.self && window.self.XLSX,
  ];

  return pickXlsx(candidates);
}

function showBrowserTipWhenNeeded() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isWechat = /micromessenger/.test(ua);
  browserTip.hidden = !(isIOS && isWechat);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      saveStatus.textContent = '离线缓存未启用';
    });
  });
}

addRowBtn.addEventListener('click', addRow);
exportExcelBtn.addEventListener('click', exportExcel);
clearBtn.addEventListener('click', clearRows);

showBrowserTipWhenNeeded();
registerServiceWorker();
render();
