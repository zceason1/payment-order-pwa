import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

import {
  calcRowTotal,
  computeGrandTotal,
  createEmptyRow,
  normalizeRows,
  buildWorksheetRows,
  buildExportFilename,
  buildInputLabel,
  pickXlsx,
} from '../src/core.js';

test('calcRowTotal multiplies valid quantity and price with two-decimal precision support', () => {
  assert.equal(calcRowTotal('3', '12.5'), 37.5);
  assert.equal(calcRowTotal('0.3', '10'), 3);
});

test('calcRowTotal treats blank, invalid, and negative values as zero', () => {
  assert.equal(calcRowTotal('', '12'), 0);
  assert.equal(calcRowTotal('2', ''), 0);
  assert.equal(calcRowTotal('abc', '12'), 0);
  assert.equal(calcRowTotal('-1', '12'), 0);
});

test('computeGrandTotal sums only valid non-negative rows', () => {
  const rows = [
    { quantity: '2', price: '8.5' },
    { quantity: '3', price: '4' },
    { quantity: '-2', price: '99' },
    { quantity: 'abc', price: '4' },
  ];

  assert.equal(computeGrandTotal(rows), 29);
});

test('normalizeRows keeps existing rows and guarantees one blank row when empty', () => {
  const existing = [{ id: 'row_9', product: '胶带', unit: '箱', quantity: '2', price: '12' }];
  assert.deepEqual(normalizeRows(existing), existing);

  const normalized = normalizeRows([]);
  assert.equal(normalized.length, 1);
  assert.match(normalized[0].id, /^row_/);
});

test('createEmptyRow creates a stable row object for form state', () => {
  assert.deepEqual(createEmptyRow(7), {
    id: 'row_7',
    product: '',
    unit: '',
    quantity: '',
    price: '',
  });
});

test('buildWorksheetRows returns title, date, header, data rows, and total row', () => {
  const rows = [
    { product: '螺丝', unit: '盒', quantity: '2', price: '3.5' },
    { product: '扳手', unit: '把', quantity: '', price: '9' },
  ];

  const sheetRows = buildWorksheetRows(rows, new Date('2026-06-22T08:00:00+08:00'));

  assert.deepEqual(sheetRows, [
    ['产品货款单'],
    ['制单日期：2026/6/22'],
    ['序号', '产品', '单位', '数量', '单价（元）', '合价（元）'],
    [1, '螺丝', '盒', 2, 3.5, 7],
    [2, '扳手', '把', '', 9, 0],
    ['', '', '', '', '总计（小写：人民币）', 7],
  ]);
});

test('buildExportFilename uses yyyy-mm-dd format and xlsx extension', () => {
  assert.equal(buildExportFilename(new Date(2026, 5, 22, 8, 0, 0)), '产品货款单_2026-06-22.xlsx');
  assert.equal(buildExportFilename(new Date(2026, 0, 1, 0, 30, 0)), '产品货款单_2026-01-01.xlsx');
});

test('buildInputLabel creates unique accessible labels for desktop and mobile inputs', () => {
  const row = createEmptyRow(3);

  assert.equal(buildInputLabel('桌面', '产品名称', row.id), '桌面-产品名称-row_3');
  assert.equal(buildInputLabel('移动', '产品名称', row.id), '移动-产品名称-row_3');
});

test('pickXlsx returns the first candidate that looks like the SheetJS API', () => {
  const usable = { utils: {}, write() {} };

  assert.equal(pickXlsx([undefined, {}, usable]), usable);
  assert.equal(pickXlsx([undefined, {}, { utils: {} }]), null);
});

test('xlsx bridge exposes a CommonJS-style export as window.XLSX', () => {
  const bridgeCode = fs.readFileSync(new URL('../assets/xlsx-bridge.js', import.meta.url), 'utf8');
  const usable = { utils: {}, write() {} };
  const context = {
    window: {
      self: {},
    },
    exports: usable,
  };
  context.window.globalThis = context.window;
  vm.createContext(context);

  vm.runInContext(bridgeCode, context);

  assert.equal(context.window.XLSX, usable);
});
