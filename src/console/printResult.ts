
import Tuple from '../Tuple'
import Relation from '../Relation'
import printAsTable from './printAsTable'

function isMultiColumn(rels: Tuple[]) {
    const columns = new Map()
    for (const rel of rels) {
        for (const tag of rel.tags) {
            columns.set(tag.attr, true)
            if (columns.size > 1)
                return true;
        }
    }
    return false;
}

export function stringifyResult(rel: Relation): string[] {
    const out = []

    const tuples = rel.bodyArr();

    if (isMultiColumn(tuples)) {
        for (const line of printAsTable(tuples)) {
            out.push('  ' + line);
        }
    } else {
        for (const rel of tuples) {
            out.push('  ' + rel.stringify());
        }
    }
    return out;
}

export default function printResult(rel: Relation) {
    if (rel.hasError()) {
        printError(rel);
        return;
    }

    for (const line of stringifyResult(rel))
        console.log(line);
}

export function printError(rel: Relation) {

    for (const t of rel.tuples) {
        if (!t.isCommandError())
            continue;

        if (t.has('message') && !t.has('stack'))
            console.log('Error: ' + t.get('message'))

        if (t.has('stack'))
            console.log(t.get('stack'));
    }
}
