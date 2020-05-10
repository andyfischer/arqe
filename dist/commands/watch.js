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
const __1 = require("..");
const query_1 = require("../query");
function default_1(snapshot) {
    snapshot.implement('watch', (query) => __awaiter(this, void 0, void 0, function* () {
        const toWatch = query.syntax.originalStr.replace(/^watch /, '');
        __1.print('running: ' + toWatch);
        while (true) {
            yield query_1.runQueryInput(snapshot, toWatch, { isInteractive: true });
        }
    }));
}
exports.default = default_1;
//# sourceMappingURL=watch.js.map