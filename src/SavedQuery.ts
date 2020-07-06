
/*
import Graph from './Graph'
import Command from './Command'
import parseCommand from './parseCommand'
import Pattern from './Pattern'
import EagerValue from './EagerValue'

export default class SavedQuery {
    graph: Graph
    id: number
    queryStr: string

    command: Command
    pattern: Pattern
    changeToken: number = 0

    connectedEagerValues: { [eagerValueId: string]: EagerValue<any> } = {}

    constructor(graph: Graph, id: number, queryStr: string) {
        if (queryStr.startsWith('get '))
            throw new Error("SavedQuery queryStr should not start with 'get': " + queryStr);

        this.graph = graph;
        this.id = id;
        this.queryStr = queryStr;
        this.command = parseCommand('get ' + queryStr);
        this.pattern = this.command.toPattern();
    }

    connectEagerValue(ev: EagerValue<any>) {
        this.connectedEagerValues[ev.id] = ev;
    }

    updateConnectedValues() {
        for (const id in this.connectedEagerValues)
            this.connectedEagerValues[id].runUpdate();
    }
}
*/
