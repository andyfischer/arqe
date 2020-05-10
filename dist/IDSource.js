"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IDSource {
    constructor(prefix = '') {
        this.next = 1;
        this.prefix = prefix;
    }
    take() {
        const result = this.prefix + this.next + '';
        this.next += 1;
        return result;
    }
}
exports.default = IDSource;
//# sourceMappingURL=IDSource.js.map