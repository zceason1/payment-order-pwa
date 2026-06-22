export function createEmptyRow(idNumber = Date.now()) {
  return {
    id: `row_${idNumber}`,
    product: '',
    unit: '',
    quantity: '',
    price: '',
  };
}

export function normalizeRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createEmptyRow(1)];
  }

  return rows.map((row, index) => ({
    id: row.id || `row_${index + 1}`,
    product: row.product || '',
    unit: row.unit || '',
    quantity: row.quantity === undefined || row.quantity === null ? '' : String(row.quantity),
    price: row.price === undefined || row.price === null ? '' : String(row.price),
  }));
}

function parseMoneyInput(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return parsed;
}

export function calcRowTotal(quantity, price) {
  const qty = parseMoneyInput(quantity);
  const unitPrice = parseMoneyInput(price);
  if (qty === null || unitPrice === null) return 0;
  return Number((qty * unitPrice).toFixed(2));
}

export function computeGrandTotal(rows) {
  return normalizeRows(rows).reduce((sum, row) => sum + calcRowTotal(row.quantity, row.price), 0);
}

export function formatMoney(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return '0.00';
  return number.toFixed(2);
}

export function buildWorksheetRows(rows, date = new Date()) {
  const normalizedRows = normalizeRows(rows);
  const dateText = date.toLocaleDateString('zh-CN');
  const output = [
    ['产品货款单'],
    [`制单日期：${dateText}`],
    ['序号', '产品', '单位', '数量', '单价（元）', '合价（元）'],
  ];

  normalizedRows.forEach((row, index) => {
    const quantity = row.quantity === '' ? '' : Number.parseFloat(row.quantity);
    const price = row.price === '' ? '' : Number.parseFloat(row.price);
    output.push([
      index + 1,
      row.product || '',
      row.unit || '',
      Number.isNaN(quantity) ? '' : quantity,
      Number.isNaN(price) ? '' : price,
      calcRowTotal(row.quantity, row.price),
    ]);
  });

  output.push(['', '', '', '', '总计（小写：人民币）', Number(computeGrandTotal(normalizedRows).toFixed(2))]);
  return output;
}

export function buildExportFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `产品货款单_${year}-${month}-${day}.xlsx`;
}

export function buildInputLabel(surface, label, rowId) {
  return `${surface}-${label}-${rowId}`;
}

export function pickXlsx(candidates) {
  return candidates.find((candidate) => candidate && candidate.utils && candidate.write) || null;
}
