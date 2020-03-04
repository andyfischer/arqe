
import Graph from './Graph'
import { parseCommandChain } from './parseCommand'

interface Options {
    expectOne?: boolean
    inputs?: any[]
}

export default class GraphSavedQueryAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    func(commandStr: string, options: Options) {
        return (...inputs) => {
            const command = parseCommandChain(commandStr);

        }
    }

    run(s: string) {
        this.graph.run(s);
    }
}
