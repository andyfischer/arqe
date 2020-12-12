
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

export default function printResult(rel: Relation) {
    if (rel.hasError()) {
        printError(rel);
        return;
    }

    const tuples = rel.bodyArray();

    if (isMultiColumn(tuples)) {
        for (const line of printAsTable(tuples)) {
            console.log('  ' + line);
        }
    } else {
        for (const rel of tuples) {
            console.log('  ' + rel.stringify());
        }
    }
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
