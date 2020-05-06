
import Graph from './Graph'
import RelationReceiver, { receiveToRelationStream } from './RelationReceiver'
import Runnable from './Runnable'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default class GraphRepl {
    graph: Runnable
    repl: any

    constructor(graph: Runnable) {
        this.graph = graph;
    }

    async eval(line, onDone) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            onDone();
            return;
        }

        this.graph.run(line, {
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');

                if (rel.hasType('command-meta'))
                    return;

                console.log(' > ' + rel.stringifyRelation());
            },
            finish: () => {
                isFinished = true;
                onDone();
            }
        });
    }
}

