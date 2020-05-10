"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm_1 = require("../vm");
const defCommand_1 = __importDefault(require("./defCommand"));
const defRelation_1 = __importDefault(require("./defRelation"));
const relate_1 = __importDefault(require("./relate"));
function bootstrap(scope) {
    vm_1.mountFunction(scope, 'def-command', {
        inputs: [{
                fromMeta: 'scope'
            }, {
                fromPosition: 0,
                fromName: 'command-name',
                isRequired: true
            }],
        callback: defCommand_1.default,
        outputs: []
    });
    vm_1.mountFunction(scope, 'def-relation', {
        inputs: [{
                fromPosition: 0,
                fromName: 'relation-name',
                isRequired: true
            }],
        callback: defRelation_1.default,
        outputs: []
    });
    vm_1.mountFunction(scope, 'relate', {
        inputs: [],
        callback: relate_1.default,
        outputs: []
    });
}
exports.default = bootstrap;
//# sourceMappingURL=bootstrapPrimitives.js.map