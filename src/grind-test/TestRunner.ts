
import TestSuite from './TestSuite'
import ChaosFlags from './ChaosFlags'
import collectRespond from '../collectRespond'
import verifyRespondProtocol from '../verifyRespondProtocol'
import Graph from '../Graph'
import parseCommand, { parsedCommandToString } from '../parseCommand'

export default class TestRunner {
    suite: TestSuite
    shortDescription: string
    flags: ChaosFlags = {}
    graph: Graph

    constructor(suite: TestSuite, flags: ChaosFlags = {}, shortDescription?: string) {
        this.suite = suite;
        this.graph = new Graph();
        this.flags = flags;
        this.shortDescription = shortDescription;
    }

    modifyRunCommand(command: string) {
        // test parse & stringify.
        // test with added extra tags.

        if (this.flags.reparseCommand) {
            const parsed = parseCommand(command);
            command = parsedCommandToString(parsed);
        }

        return command;
    }

    run = (command) => {
        const { graph } = this;

        command = this.modifyRunCommand(command);

        const verifier = verifyRespondProtocol(command, (err) => {
            fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
        });

        let response;
        let responseFinished = false;
        let resolveResponse;

        const collector = collectRespond(finishedValue => {

            responseFinished = true;

            if (resolveResponse) {
                // Async finish
                resolveResponse(finishedValue);
            } else {
                // Sync finish
                response = finishedValue;
            }
        });

        graph.run(command, msg => {
            verifier(msg);
            collector(msg);
        });

        if (responseFinished)
            return response;

        // Didn't finish synchronously, so turn this into a Promise.
        return new Promise(r => { resolveResponse = r; });
    }
}
