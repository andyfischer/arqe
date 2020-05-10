"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timedate_1 = require("../timedate");
function default_1(snapshot) {
    snapshot.implement('get-date-stamp', (query) => {
        query.respond(timedate_1.getDateStamp());
    });
}
exports.default = default_1;
//# sourceMappingURL=timedate.js.map