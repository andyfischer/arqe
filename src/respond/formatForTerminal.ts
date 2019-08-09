
import formatToTable from './formatToTable'

export default function formatForTerminal(value: any): string {
    if (!value)
        return '';

    if (value.terminalFormat === 'table')
        return formatToTable(value);

    if (value.type === 'string[]') {
        return JSON.stringify(value.value, null, 2);
        //return value.value.join('\n');
    }

    if (typeof value.body === 'string')
        return value.body;

    if (typeof value === 'string')
        return value;

    if (value.error) {
        return 'error: ' + value.error;
    }

    return JSON.stringify(value);
}
