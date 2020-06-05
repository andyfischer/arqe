
import Relation from '../Relation'
import printAsTable from './printAsTable'

function isMultiColumn(rels: Relation[]) {
    const columns = new Map()
    for (const rel of rels) {
        for (const tag of rel.tags) {
            columns.set(tag.tagType, true)
            if (columns.size > 1)
                return true;
        }
    }
    return false;
}

export default function printResult(rels: Relation[]) {
    if (isMultiColumn(rels)) {
        for (const line of printAsTable(rels)) {
            console.log('  ' + line);
        }
    } else {
        for (const rel of rels) {
            console.log('  ' + rel.stringify());
        }
    }
}
