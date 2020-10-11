
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import fs from 'fs'
import { emitCommandError } from '../CommandUtils'

export class FsFileContents {
    graph: Graph
    supportsCompleteScan: false
    name: string
    schemaStr: string

    constructor(graph: Graph, name: string, schema: string, filename: string) {
    }
    select(pattern: Tuple, out: Stream) {
    }
    insert(tuple: Tuple, out: Stream) {
    }
    delete(search: Tuple, out: Stream) {
    }
}
