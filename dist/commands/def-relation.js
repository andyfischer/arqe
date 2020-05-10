"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const verbose = false;
function default_1(snapshot) {
    snapshot.implement('def-relation', (query) => __awaiter(this, void 0, void 0, function* () {
        const rel = query.args[0];
        query.snapshot.modifyGlobal('relations', set => {
            if (!set) {
                set = {};
            }
            if (!set[rel]) {
                set[rel] = true;
                if (verbose)
                    utils_1.print('defined relation: ' + rel);
            }
            return set;
        });
    }));
}
exports.default = default_1;
//# sourceMappingURL=def-relation.js.map