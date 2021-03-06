
import Repl from 'repl'
import Path from 'path'
import os from 'os'
import Graph from '../Graph'
import GraphRepl, { ReplOptions } from '../console/Repl'
import debounce from '../utils/debounce'

export default function startRepl(graph: Graph, opts: ReplOptions = {}) {

    let repl;
    let lastLineIsPrompt = false;
    const graphRepl = new GraphRepl(graph, opts);

    const actualConsoleLog = console.log;
    const delayedDisplayPrompt = debounce(100, () => displayPrompt());

    function displayPrompt() {
        repl.displayPrompt();
        lastLineIsPrompt = true;
    }

    console.log = (...args) => {
        if (lastLineIsPrompt)
            actualConsoleLog.apply(null, []);

        actualConsoleLog.apply(null, args);
        lastLineIsPrompt = false;
        delayedDisplayPrompt();
    }

    repl = Repl.start({
        prompt: opts.customPrompt || 'arqe~ ',
        eval: line => graphRepl.eval(line, () => {
            displayPrompt()
        })
    });

    lastLineIsPrompt = true;

    try {
        repl.setupHistory(Path.join(os.homedir(), '.arqe_history'), () => {});
    } catch (e) { }

    repl.on('exit', () => {
        process.exit(0);
    });
}
