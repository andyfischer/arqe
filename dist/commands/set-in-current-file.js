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
function default_1(snapshot) {
    snapshot.implement('set-in-current-file', (query) => __awaiter(this, void 0, void 0, function* () {
        const key = query.args[1];
        const value = query.args[2];
        query.snapshot.fileScope.set(key, value);
        return;
    }));
}
exports.default = default_1;
//# sourceMappingURL=set-in-current-file.js.map