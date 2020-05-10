#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const utils_1 = require("../utils");
const storage_1 = require("../storage");
const bootstrap_runtime_1 = require("../bootstrap-runtime");
const scope_1 = require("../scope");
const nodeRepl_1 = __importDefault(require("../terminal/nodeRepl"));
const VM_1 = require("../VM");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield storage_1.setupUserDir();
        const graph = new scope_1.Graph();
        const scope = new scope_1.Scope(graph);
        yield bootstrap_runtime_1.loadStdlibScope(scope);
        const args = process.argv.slice(2);
        const vm = new VM_1.VM(scope);
        if (args.length > 0) {
            utils_1.print('error: sorry not working');
            return;
        }
        nodeRepl_1.default(vm);
    });
}
main()
    .catch(console.error);
//# sourceMappingURL=main.js.map