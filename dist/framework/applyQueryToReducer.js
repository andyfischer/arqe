"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const logChanges = !!process.env.log_document_changes;
function applyQueryToDocument(snapshot, reducer, query) {
    let previousValue;
    const log = logChanges && !reducer.spamsChangeLog;
    if (log)
        previousValue = JSON.stringify(reducer.value);
    reducer.value = reducer.reducer(query, reducer.value);
    Promise.resolve(reducer.value).catch(err => {
        utils_1.print('error: ' + err);
        if (err.stack && snapshot.getValueOpt('enable-stack-traces', false))
            console.log(err.stack);
    });
    if (log) {
        const newValue = JSON.stringify(reducer.value);
        if (previousValue != newValue) {
            utils_1.print(`document '${reducer.name}' has changed value:`);
            utils_1.print(`  was: ${previousValue}`);
            utils_1.print(`  now: ${newValue}`);
        }
    }
}
exports.default = applyQueryToDocument;
//# sourceMappingURL=applyQueryToReducer.js.map