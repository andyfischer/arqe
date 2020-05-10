"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sourcePosToString(pos) {
    const filename = pos.filename || '(no filename)';
    return `${filename}:${pos.lineStart}:${pos.columnStart}`;
}
exports.sourcePosToString = sourcePosToString;
