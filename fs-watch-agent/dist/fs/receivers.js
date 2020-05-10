"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function receiveToRelationList(onDone) {
    const list = [];
    return {
        relation(rel) { list.push(rel); },
        finish() {
            onDone(list);
        }
    };
}
exports.receiveToRelationList = receiveToRelationList;
function receiveToRelationListPromise() {
    let receiver;
    const promise = new Promise((resolve, reject) => {
        receiver = receiveToRelationList((rels) => {
            for (const rel of rels) {
                if (rel.hasType('command-meta') && rel.hasType('error')) {
                    reject(rel.stringify());
                    return;
                }
            }
            resolve(rels);
        });
    });
    return { receiver, promise };
}
exports.receiveToRelationListPromise = receiveToRelationListPromise;
function fallbackReceiver(commandString) {
    return {
        relation(rel) {
            if (rel.hasType('command-meta') && rel.hasType('error')) {
                console.log(`Uncaught error for command (${commandString}): ${rel.stringifyRelation()}`);
            }
        },
        finish() { }
    };
}
exports.fallbackReceiver = fallbackReceiver;
//# sourceMappingURL=receivers.js.map