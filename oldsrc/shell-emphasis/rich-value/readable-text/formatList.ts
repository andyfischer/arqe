
import { RichValue } from '..'

export default function formatList(val: RichValue) {
    let out = '';
    let indent = '';

    if (val.title) {
        out += val.title + '\n';
        indent = ' ';
    }

    if (val.items.length === 0) {
        out += indent + '(empty list)'
    } else {
        const strs = val.items.map(item => indent + '- ' + item);
        
        out += strs.join('\n');
    }

    return out;
}
