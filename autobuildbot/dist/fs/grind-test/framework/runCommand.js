"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyRespondProtocol_1 = __importDefault(require("../../verifyRespondProtocol"));
const receiveToStringList_1 = __importDefault(require("../../receiveToStringList"));
function run(command, opts) {
    const allowError = opts && opts.allowError;
    if (opts.chaosMode && opts.chaosMode.modifyRunCommand)
        command = opts.chaosMode.modifyRunCommand(command);
    const verifier = verifyRespondProtocol_1.default(command, (err) => {
        fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
    });
    return new Promise((resolve, reject) => {
        const collector = receiveToStringList_1.default(resolve);
        opts.graph.run(command, collector);
    });
}
exports.default = run;
//# sourceMappingURL=runCommand.js.map