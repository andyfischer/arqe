"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRowValues(incomingData) {
    if (incomingData.items)
        return incomingData.items;
    return incomingData;
}
function toTitle(name) {
    if (name.length === 0)
        return name;
    name = name.slice(0, 1).toUpperCase() + name.slice(1);
    return name;
}
function toString(value) {
    if (typeof value === 'string')
        return value;
    return JSON.stringify(value);
}
function dashes(count) {
    return '-'.repeat(count);
}
function spaces(count) {
    return ' '.repeat(count);
}
function centerPad(s, length) {
    if (s.length >= length)
        return s;
    const needSpaces = length - s.length;
    let leftSpaces = Math.floor(needSpaces / 2);
    let rightSpaces = Math.ceil(needSpaces / 2);
    return spaces(leftSpaces) + s + spaces(rightSpaces);
}
function formatTable(value) {
    const rowValues = getRowValues(value);
    if (rowValues.length === 0)
        return '[]';
    const keys = Object.keys(rowValues[0]);
    const columns = [];
    for (const key of keys) {
        columns.push({
            length: key.length,
            label: toTitle(key)
        });
    }
    const rows = [];
    for (const rowValue of rowValues) {
        const values = Object.values(rowValue);
        const cells = [];
        for (let i = 0; i < values.length; i++) {
            const column = columns[i];
            const cellValue = values[i];
            cells.push({
                column,
                value: cellValue,
                valueStr: toString(cellValue)
            });
        }
        rows.push({
            cells
        });
    }
    for (const row of rows) {
        for (const cell of row.cells) {
            const column = cell.column;
            column.length = Math.max(column.length, cell.valueStr.length);
        }
    }
    for (const column of columns) {
        column.labelFormatted = centerPad(column.label, column.length);
        column.linesFormatted = dashes(column.length);
    }
    for (const row of rows) {
        for (const cell of row.cells) {
            cell.formatted = centerPad(cell.valueStr, cell.column.length);
        }
    }
    const output = (columns.map(col => col.labelFormatted).join(' | '))
        + '\n'
        + (columns.map(col => col.linesFormatted).join(' | '))
        + '\n'
        + rows.map(row => row.cells.map(cell => cell.formatted).join(' | ')).join('\n');
    return output;
}
exports.default = formatTable;
//# sourceMappingURL=formatTable.js.map