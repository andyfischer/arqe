
import parseCommand from './parseCommand'
import Graph from './Graph'

export function createUniqueEntity(graph: Graph, typename: string) {
    const result = graph.runSync(`set ${typename}/#unique`);

    const parsed = parseCommand(result);

    if (parsed.command !== 'set')
        throw new Error('expected reply with "set": ' + result);

    return parsed.tags[0].tagValue;
}

export function getIntoObject(graph: Graph, query: string) {

    const results = graph.runSync(query);

    console.log('getIntoObject', results);

    // TODO - how to parse? 
    // results look like: [ 'option/filenameType == filename',
    // 'option/directory == /Users/afischer/test' ]

    return {}
}
