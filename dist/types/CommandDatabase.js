"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getZeroCommandDatabase() {
    return {
        byName: {
            'def-command': {
                name: 'def-command',
                args: {
                    'command-name': {
                        isRequired: true
                    }
                },
                mainArgs: ['command-name']
            },
            'def-relation': {
                name: 'def-relation',
                args: {
                    'relation-name': {
                        isRequired: true
                    }
                },
                mainArgs: ['relation-name']
            }
        }
    };
}
exports.getZeroCommandDatabase = getZeroCommandDatabase;
function getCommandDatabase(key) {
    const snapshot = key.snapshot || key;
    if (!snapshot.typeSnapshot) {
        throw new Error("expected Snapshot");
    }
    return snapshot.getValue('commandDatabase');
}
exports.getCommandDatabase = getCommandDatabase;
//# sourceMappingURL=CommandDatabase.js.map