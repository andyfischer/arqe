"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("../stdlib");
function getDateStamp() {
    const now = new Date();
    return `${stdlib_1.zeroPad(now.getUTCFullYear(), 4)}`
        + `-${stdlib_1.zeroPad(now.getUTCMonth() + 1, 2)}`
        + `-${stdlib_1.zeroPad(now.getUTCDate(), 2)}`;
}
exports.getDateStamp = getDateStamp;
//# sourceMappingURL=index.js.map