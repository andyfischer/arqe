
import formatToTable from './formatToTable'

export default function formatForTerminal(value: any): string {
    if (value.terminalFormat === 'table')
        return formatToTable(value);

    if (typeof value.body === 'string')
        return value.body;

    if (typeof value === 'string')
        return value;

    return JSON.stringify(value);
}
