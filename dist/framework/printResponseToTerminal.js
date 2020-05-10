"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const readable_text_1 = __importDefault(require("../rich-value/readable-text"));
function printResponseToTerminal(query, data) {
    utils_1.print(readable_text_1.default(query.snapshot, data));
}
exports.default = printResponseToTerminal;
//# sourceMappingURL=printResponseToTerminal.js.map