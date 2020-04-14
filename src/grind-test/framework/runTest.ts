
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

    it(name, () => callback({run, graph}));
}
