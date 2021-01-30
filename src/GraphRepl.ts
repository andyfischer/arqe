
import Graph from './Graph'
import Stream from './Stream'
import { receiveToTupleList } from './receiveUtils'
import printResult from './console/printResult'
import Tuple from './Tuple'
import { toQuery, QueryLike } from './coerce'
import { queryToJson } from './Query'
import Pipe, { EnablePipeTracing } from './Pipe'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

class SlowResponseTimer {
    timer: any
    queryLike: QueryLike
    outputPipe: Pipe

    constructor(queryLike: QueryLike, outputPipe: Pipe) {
        this.queryLike = queryLike;
        this.outputPipe = outputPipe;
        this.timer = setTimeout(() => this.afterDelay(), 2000);
    }

    afterDelay() {
        console.log(`Slow query (${this.queryLike}), still running after 2 seconds`);
        if (EnablePipeTracing) {
            console.log('Trace:')
            console.log(stringifyPipeTrace(this.outputPipe).join('\n'));
        } else {
            console.log('(run with EnablePipeTracing to see trace)');
        }
    }

    cancel() {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

export interface ReplOptions {
    customPrompt?: string
}

export default class GraphRepl {
    graph: Graph
    opts: ReplOptions

    constructor(graph: Graph, opts: ReplOptions) {
        this.graph = graph;
        this.opts = opts;
    }

    async eval(line: QueryLike, onDone) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            onDone();
            return;
        }

        const outputPipe = this.graph.run(line);

        const slowResponseTimer = new SlowResponseTimer(line, outputPipe);

        outputPipe
        .then(rel => {

            slowResponseTimer.cancel();

            printResult(rel);
            onDone();
        })
    }
}

function stringifyPipeTrace(outputPipe: Pipe) {
    const lines = [];
    let searchPipes: Pipe[] = [outputPipe];

    while (searchPipes.length > 0) {
        let nextSearch = [];

        for (const search of searchPipes) {

            let line = ` * ${search.id}`

            line += search.isDone() ? ' [closed] ' : '[ open ]';

            if (search._traceLabel)
                line += ` ${search._traceLabel}`;

            for (const { input, label } of (search._tracedInputs || [])) {
                nextSearch.push(input);

                line += ` (${label} ${input.id})`
            }

            if (!search._traceLabel) {
                line += ', no pipe label: ' + search._traceStack;
            }

            lines.unshift(line);
        }

        searchPipes = nextSearch;
    }

    return lines;
}
