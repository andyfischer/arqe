
import Graph from './Graph'
import Stream from './Stream'
import { receiveToTupleList } from './receiveUtils'
import printResult from './console/printResult'
import Tuple from './Tuple'
import { toQuery } from './coerce'
import { queryToJson } from './Query'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default class GraphRepl {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    async eval(line, onDone) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            onDone();
            return;
        }

        this.graph.run(line)
        .then(rel => {
            printResult(rel);
            onDone();
        })
    }
}

