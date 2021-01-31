import Tag from '../Tag'
import { isTuple } from '../Tuple'
import { symValueStringify } from "../internalSymbols"
import exprToString from "./exprToString"

function tagValueNeedsBrackets(s: string) {
    for (let i = 0; i < s.length; i++)
        if (s.charAt(i) === ' ' || s.charAt(i) === '*' || s.charAt(i) === '/')
            return true;

    return false;
}

function valueToString(value: any): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number')
        return ''+value;

    if (typeof value === 'boolean')
        return ''+value;

    if (value[symValueStringify] !== undefined)
        return value[symValueStringify](value);

    return '<native>'
}

export default function tagToString(tag: Tag) {
    if (tag.star && tag.identifier)
        return '$' + tag.identifier;

    if (tag.star)
        return '*';

    if (tag.doubleStar)
        return '**'

    if (tag.attr && tag.value === null && tag.identifier) {
        return tag.attr + '/$' + tag.identifier;
    }

    if (tag.hasValue()) {

        let s = '';

        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `;
        }

        s += tag.attr;

        if (isTuple(tag.value)) {
            s += '(' + tag.value.stringify() + ')';
        } else {
            const valStr = valueToString(tag.value);

            if (tagValueNeedsBrackets(valStr)) {
                s += '[' + valStr + ']'
            } else {
                s += '/' + valStr;
            }
        }

        return s;
    }

    if (tag.exprValue) {
        return tag.attr + '/' + exprToString(tag.exprValue)

    } else if (tag.starValue) {
        return tag.attr + '/*';
    }

    if (tag.attr) {
        let s = '';
        if (tag.identifier) {
            s += `[from \$${tag.identifier}] `
        }
        s += tag.attr;

        if (tag.optional)
            s += '?';

        return s;
    }
    
    throw new Error('unhandled case in patternTagToString: ' + JSON.stringify(tag));

    return ''
}

