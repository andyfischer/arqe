"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TagTypeOrdering_1 = __importDefault(require("./TagTypeOrdering"));
class Schema {
    constructor() {
        this.ordering = new TagTypeOrdering_1.default();
    }
    stringifyRelation(rel) {
        return rel.stringify(this);
    }
}
exports.default = Schema;
