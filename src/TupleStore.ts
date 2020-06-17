
import Tuple from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import Stream from './Stream'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import QueryPlan, { QueryTag } from './QueryPlan'
import Table from './Table'
import TableInterface from './TableInterface'
import { parsePattern } from './parseCommand'
import TuplePatternMatcher from './TuplePatternMatcher'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import { GenericStream, StreamCombine } from './TableInterface'
import { combineStreams } from './StreamUtil'

export default class TupleStore {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;

        // this.defineInMemoryTable('table_schema', parsePattern("table(*) schema"));
    }

}
