
interface Column {
    length: number
    label: string
    labelFormatted?: string
    linesFormatted?: string
}

interface Row {
    cells: Cell[]
}

interface Cell {
    column: Column
    value: any
    valueStr?: string
    formatted?: string
}

function getRowValues(incomingData: any): any[] {
    if (incomingData.items)
        return incomingData.items;

    return incomingData;
}

function toTitle(name: string) {
    if (name.length === 0)
        return name;

    name = name.slice(0,1).toUpperCase() + name.slice(1)
    return name;
}

function toString(value: any) {
    if (typeof value === 'string')
        return value;

    return JSON.stringify(value);
}

function dashes(count: number) {
    return '-'.repeat(count);
}

function spaces(count: number) {
    return ' '.repeat(count);
}

function centerPad(s: string, length: number) {
    if (s.length >= length)
        return s;

    const needSpaces = length - s.length;

    let leftSpaces = Math.floor(needSpaces / 2);
    let rightSpaces = Math.ceil(needSpaces / 2);

    return spaces(leftSpaces) + s + spaces(rightSpaces);
}

export default function formatToTable(value: any): string {

    const rowValues = getRowValues(value);

    if (rowValues.length === 0)
        return '[]'

    const keys = Object.keys(rowValues[0]);

    // init columns
    const columns: Column[] = [];
    for (const key of keys) {
        columns.push({
            length: key.length,
            label: toTitle(key)
        })
    }

    // init rows
    const rows: Row[] = [];
    for (const rowValue of rowValues) {
        const values = Object.values(rowValue);
        const cells:Cell[] = [];

        for (let i=0; i < values.length; i++) {
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

    // look at every row and figure out each column's width
    for (const row of rows) {
        for (const cell of row.cells) {
            const column = cell.column;
            column.length = Math.max(column.length, cell.valueStr.length);
        }
    }

    // Write formatted strings
    for (const column of columns) {
        column.labelFormatted = centerPad(column.label, column.length);
        column.linesFormatted = dashes(column.length); //centerPad(dashes(column.label.length), column.length);
    }

    for (const row of rows) {
        for (const cell of row.cells) {
            cell.formatted = centerPad(cell.valueStr, cell.column.length);
        }
    }

    const output = '\n' +
        (columns.map(col => col.labelFormatted).join(' | '))
        + '\n'
        + (columns.map(col => col.linesFormatted).join(' | '))
        + '\n'
        + rows.map(row => row.cells.map(cell => cell.formatted).join(' | ')).join('\n');

    return output;
}
