
import Graph from './Graph'
import Command from './Command'
import parseCommand from './parseCommand'
import RelationPattern from './RelationPattern'
import EagerValue from './EagerValue'

export default class SavedQuery {
    graph: Graph
    id: number
    queryStr: string

    command: Command
    pattern: RelationPattern
    changeToken: number = 0

    connectedEagerValues: EagerValue<any>[] = []

    constructor(graph: Graph, id: number, queryStr: string) {
        this.graph = graph;
        this.id = id;
        this.queryStr = queryStr;
        this.command = parseCommand(queryStr);
        this.pattern = this.command.toPattern();
    }
}
