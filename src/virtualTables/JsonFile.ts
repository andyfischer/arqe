
import Graph from '../Graph'
import Tuple from '../Tuple'
import Stream from '../Stream'
import TableInterface, { } from '../TableInterface'
import GenericStream, { StreamCombine } from '../GenericStream'
import fs from 'fs'
import { emitCommandError } from '../CommandMeta'

export class FsFileContents implements TableInterface {
    graph: Graph
    supportsCompleteScan: false
    name: string
    schema: string

    constructor(graph: Graph, name: string, schema: string, filename: string) {
    }
    search(pattern: Tuple, out: Stream) {
    }
    insert(tuple: Tuple, out: Stream) {
    }
    delete(search: Tuple, out: Stream) {
    }
}
