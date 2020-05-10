"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class TypeInfo {
    constructor() {
        this.everyValue = {};
    }
    getUniqueId() {
        let attempts = 0;
        while (attempts < 100) {
            const id = utils_1.randomHex(5);
            if (this.everyValue[id])
                continue;
            return id;
        }
        throw new Error('failed to generate a unique ID');
    }
}
exports.default = TypeInfo;
//# sourceMappingURL=TagType.js.map