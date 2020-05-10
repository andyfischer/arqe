"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toQuotedString(s) {
    if (s[0] === '"' || s[0] === "'")
        return s;
    return "'" + s + "'";
}
exports.toQuotedString = toQuotedString;
function toIdentifier(s) {
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '-' || s[i] === ' ') {
            // drop the dash and capitalize the next letter
            s = s.slice(0, i) + s[i + 1].toUpperCase() + s.slice(i + 2, s.length);
        }
    }
    return s;
}
exports.toIdentifier = toIdentifier;
