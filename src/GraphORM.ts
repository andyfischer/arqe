
import parseCommand from './parseCommand'
import Graph from './Graph'

export function createUniqueEntity(graph: Graph, typename: string) {
    const result = graph.handleCommandStr(`set ${typename}/#unique`);

    const parsed = parseCommand(result);

    if (parsed.command !== 'set')
        throw new Error('expected reply with "set": ' + result);

    return parsed.tags[0].tagValue;
}
