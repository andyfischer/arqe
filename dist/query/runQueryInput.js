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
const parseQueryStructure_1 = __importDefault(require("../parse-query/parseQueryStructure"));
const runOneQuery_1 = __importDefault(require("./runOneQuery"));
const utils_1 = require("../utils");
const parse_query_1 = require("../parse-query");
const verbose = !!process.env.verbose;
function runInput(snapshot, input, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof input !== 'string')
            throw new Error("query must be a string, got: " + input);
        if (verbose)
            utils_1.print('running input: ' + input);
        let lastContext = null;
        for (const syntax of parse_query_1.parseQueryInput(input, { filename: opts && opts.sourceFilename })) {
            const query = parseQueryStructure_1.default(snapshot, syntax);
            if (opts && opts.isInteractive) {
                query.isInteractive = true;
            }
            if (opts && opts.sourceFilename) {
                query.syntax.sourcePos.filename = opts.sourceFilename;
            }
            query.snapshot = snapshot;
            lastContext = yield runOneQuery_1.default(snapshot, query);
        }
        return lastContext;
    });
}
exports.default = runInput;
//# sourceMappingURL=runQueryInput.js.map