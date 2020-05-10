"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(query) {
    if (query.relationSubject === 'bootstrap-scripts') {
        if (query.relation === 'includes') {
            query.snapshot.modifyGlobal('bootstrapScripts', value => {
                if (!value)
                    value = { scripts: {} };
                for (const arg of query.args)
                    value.scripts[arg] = true;
                return value;
            });
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=bootstrapScripts.js.map