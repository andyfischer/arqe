"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RelationReceiver_1 = require("./RelationReceiver");
function runJoin(commandExec) {
    if (!commandExec.input)
        throw new Error('join expected input');
    let inputFinished = false;
    let searchFinished = false;
    let triggeredOutput = false;
    let searchRels = null;
    commandExec.input.onDone = () => {
        inputFinished = true;
        check();
    };
    const search = RelationReceiver_1.collectRelationReceiverOutput((rels) => {
        searchRels = rels;
        searchFinished = true;
        check();
    });
    const check = () => {
        if (triggeredOutput)
            return;
        if (inputFinished && searchFinished) {
            triggeredOutput = true;
            sendOutput();
        }
    };
    const sendOutput = () => {
        console.log('join has finished!');
    };
}
exports.runJoin = runJoin;
//# sourceMappingURL=join.js.map