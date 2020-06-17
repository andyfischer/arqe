
import Graph from '../../Graph'
import runCommand from './runCommand'

interface RunOptions {
    allowError?: true
}

export default function test(name, callback) {

    const graph = new Graph()

    function run(command, opts?: RunOptions) {
        return runCommand(command, { graph, ... opts });
    }

    function set(command) {
        if (!command.startsWith('set '))
            command = 'set ' + command;

        return run(command);
    }

    function listen(command: string) {
        if (!command.startsWith('listen '))
            command = 'listen ' + command;

        let log = [];

        graph.run(command, {
            next(rel) {
                if (rel.hasAttr('command-meta'))
                    return;
                log.push(rel.stringify());
            },
            finish() { }
        });

        return function getLog() {
            const out = log;
            log = [];
            return out;
        }

    }

    it(name, () => callback({run, set, listen, graph}));
}
