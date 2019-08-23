
import formatTable from './formatTable'
import { Snapshot } from '../..'
import { RichValue, assertValue } from '..'

export default function format(snapshot: Snapshot, value: RichValue): string {
    assertValue(value);

    if (value.terminalFormat === 'table')
        return formatTable(value);

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
