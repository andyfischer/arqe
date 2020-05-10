"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cursor_1 = __importDefault(require("./Cursor"));
function resolveSelector(file, selector) {
    const cursor = new Cursor_1.default(file);
    return cursor;
}
exports.default = resolveSelector;
//# sourceMappingURL=runChangeCommand.js.map