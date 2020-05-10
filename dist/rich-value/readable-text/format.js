"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formatTable_1 = __importDefault(require("./formatTable"));
const formatList_1 = __importDefault(require("./formatList"));
const __1 = require("..");
function format(snapshot, value) {
    __1.assertValue(value);
    if (value.terminalFormat === 'table')
        return formatTable_1.default(value);
    if (__1.isList(value))
        return formatList_1.default(value);
    if (value.type === 'string[]') {
        return JSON.stringify(value.value, null, 2);
    }
    if (typeof value.body === 'string')
        return value.body;
    if (typeof value === 'string')
        return value;
    if (value.error) {
        return 'error: ' + value.error;
    }
    return JSON.stringify(value);
}
exports.default = format;
//# sourceMappingURL=format.js.map