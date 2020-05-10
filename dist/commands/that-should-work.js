"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function default_1(snapshot) {
    snapshot.implement('that-should-work', (query) => {
        const str = query.get('lastQueryStr');
        const shouldWork = 'should-work -- ' + str;
        __1.appendToLog('should-work', shouldWork);
        query.respond(`saving: ${shouldWork}`);
    });
}
exports.default = default_1;
//# sourceMappingURL=that-should-work.js.map