
import parseCommand from './parseCommand'
import Graph from './Graph'

export function createUniqueEntity(graph: Graph, typename: string) {
    const result = graph.handleCommandStr(`save ${typename}/#unique`);

    const parsed = parseCommand(result);

    if (parsed.command !== 'save')
        throw new Error('expected reply with "save": ' + result);

    return parsed.tags[0].tagValue;
}
