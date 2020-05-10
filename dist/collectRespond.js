"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function collectRespond(onDone) {
    let first = true;
    let sawStart = false;
    let collected = null;
    let sentDone = false;
    return (message) => {
        if (sentDone)
            return;
        if (first && message === '#start') {
            collected = [];
            sawStart = true;
            return;
        }
        first = false;
        if (message === '#done') {
            if (collected === null) {
                onDone('#done');
                sentDone = true;
            }
            else {
                onDone(collected);
                sentDone = true;
            }
            return;
        }
        if (sawStart) {
            collected.push(message);
        }
        else {
            onDone(message);
            sentDone = true;
        }
    };
}
exports.default = collectRespond;
//# sourceMappingURL=collectRespond.js.map