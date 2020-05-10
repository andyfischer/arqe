"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function csi(code) {
    return '\x1B' + `[${code}m`;
}
exports.ansi_red = 31;
exports.ansi_green = 32;
exports.ansi_yellow = 33;
exports.ansi_bright_black = 90;
class AnsiColorWriter {
    constructor() {
        this.out = [];
    }
    setFG(n) {
        this.out.push(csi(n));
    }
    write(str) {
        this.out.push(str);
    }
    reset() {
        this.out.push(csi(0));
    }
    finish() {
        this.reset();
        return this.out.join('');
    }
}
exports.default = AnsiColorWriter;
//# sourceMappingURL=AnsiColorWriter.js.map