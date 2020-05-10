"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function default_1(snapshot) {
    snapshot.implement('cd', (query) => {
        const dir = query.args[0];
        try {
            process.chdir(dir);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                query.respond(__1.error('no such directory: ' + dir));
                return;
            }
            query.respond(err);
            return;
        }
        query.respond(__1.performedAction('changed directory to: ' + dir));
    });
    snapshot.implement('cwd', (query) => {
        query.respond(process.cwd());
    });
}
exports.default = default_1;
//# sourceMappingURL=cd.js.map