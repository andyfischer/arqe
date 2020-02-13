
import parseCommand, { parsePattern } from './parseCommand'
import Graph from './Graph'
import RelationPattern from './RelationPattern'

export function createUniqueEntity(graph: Graph, typename: string) {
    const result = graph.runSync(`set ${typename}/#unique`);

    const parsed = parseCommand(result);

    if (parsed.command !== 'set')
        throw new Error('expected reply with "set": ' + result);

    return parsed.tags[0].tagValue;
}

function isPrimitive(val) {
    return (val !== Object(val));
};

export async function saveObject(graph: Graph, patternStr: string, object: any): Promise<RelationPattern> {
    const parsed = parsePattern(patternStr);

    let unique = null;
    for (const tag of parsed.tags)
        if (tag.tagValue === '#unique')
            unique = tag;

    if (!unique)
        throw new Error('expected a #unique tag: ' + patternStr)

    const response = (await graph.runAsync('set ' + patternStr)) as string;
    const parsedResponse = parseCommand(response);
    const resolvedPattern = parsedResponse.toPattern();

    for (const key in object) {
        const val = object[key];
        if (!isPrimitive(val))
            continue;

        await graph.runAsync('set '
                             + resolvedPattern.addTag('option/' + key).stringify()
                             + ' == ' + object[key]);
    }

    return resolvedPattern;
}
