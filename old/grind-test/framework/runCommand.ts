import verifyRespondProtocol from '../../validation/verifyRespondProtocol'
import Graph from '../../Graph'
import { ChaosMode } from './ChaosModes'
import receiveToStringList from '../../receiveToStringList'
import GraphLike from '../../GraphLike'

interface RunOptions {
    allowError?: true
    graph: GraphLike
    chaosMode?: ChaosMode
}

export default function run(command, opts?: RunOptions): Promise<string | string[]> {
    const allowError = opts && opts.allowError;

    if (opts.chaosMode && opts.chaosMode.modifyRunCommand)
        command = opts.chaosMode.modifyRunCommand(command);

    const verifier = verifyRespondProtocol(command, (err) => {
        fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
    });

    return new Promise((resolve, reject) => {
        const collector = receiveToStringList(resolve);

        opts.graph.run(command, collector);
    });
}

