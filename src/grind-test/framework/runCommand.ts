import verifyRespondProtocol from '../../verifyRespondProtocol'
import collectRespond from '../../collectRespond'
import Graph, { RunFunc } from '../../Graph'
import ChaosMode from './ChaosMode'
import Runnable from '../../Runnable'

interface RunOptions {
    allowError?: true
    graph: Runnable
    chaosMode?: ChaosMode
}

export default function run(command, opts?: RunOptions): Promise<string> {
    const allowError = opts && opts.allowError;

    if (opts.chaosMode && opts.chaosMode.modifyRunCommand)
        command = opts.chaosMode.modifyRunCommand(command);

    const verifier = verifyRespondProtocol(command, (err) => {
        fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
    });

    return new Promise((resolve, reject) => {
        const collector = collectRespond(resolve);

        opts.graph.run(command, msg => {
            if (msg && msg.startsWith('#error') && !allowError) {
                fail(`Graph error: ${msg}`);
                reject(msg);
                return;
            }

            verifier(msg);
            collector(msg);
        });
    });
}
