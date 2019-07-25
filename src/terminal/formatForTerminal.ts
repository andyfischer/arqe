
import formatToTable from './formatToTable'

export default function formatForTerminal(value: any): string {
    if (value.terminalFormat === 'table')
        return formatToTable(value);

    if (typeof value.body === 'string')
        return value.body;

    return JSON.stringify(value);
}
