
import Graph from './Graph'
import TupleReceiver from './TupleReceiver'
import { receiveToTupleList } from './receiveUtils'
import printResult from './console/printResult'
import Tuple from './Tuple'
import GraphLike from './GraphLike'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default class GraphRepl {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async eval(line, onDone) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            onDone();
            return;
        }

        const listReceiver = receiveToTupleList((rels: Tuple[]) => {
            printResult(rels);
            isFinished = true;
            onDone();
        });

        this.graph.run(line, {
            next: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');

                if (rel.hasAttr('command-meta')) {
                    if (rel.hasAttr('error')) {
                        console.log('error: ' + rel.getVal('message'));
                    }

                    return;
                }

                listReceiver.next(rel);
            },
            done: () => {
                listReceiver.done();
                onDone();
            }
        });
    }
}

