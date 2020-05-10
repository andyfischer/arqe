"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runningInBrowser() {
    return (typeof process === 'undefined') || process.title === 'browser';
}
exports.default = runningInBrowser;
//# sourceMappingURL=runningInBrowser.js.map