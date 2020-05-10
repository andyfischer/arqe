"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stringifyRelationStream_1 = __importDefault(require("./stringifyRelationStream"));
function receiveToStringStream(onStr) {
    const stringifier = stringifyRelationStream_1.default();
    return {
        relation(rel) {
            const str = stringifier(rel);
            if (str)
                onStr(str);
        },
        finish() {
            onStr('#done');
        }
    };
}
exports.default = receiveToStringStream;
//# sourceMappingURL=receiveToStringStream.js.map