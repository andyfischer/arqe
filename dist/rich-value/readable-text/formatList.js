"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function formatList(val) {
    let out = '';
    let indent = '';
    if (val.title) {
        out += val.title + '\n';
        indent = ' ';
    }
    if (val.items.length === 0) {
        out += indent + '(empty list)';
    }
    else {
        const strs = val.items.map(item => indent + '- ' + item);
        out += strs.join('\n');
    }
    return out;
}
exports.default = formatList;
//# sourceMappingURL=formatList.js.map