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
const utils_1 = require("../utils");
function default_1(snapshot) {
    snapshot.implement('git-clone', (query) => __awaiter(this, void 0, void 0, function* () {
        const repoUrl = query.get('repo-url');
        let dir = query.getOptional('dir', null);
        if (!dir)
            dir = (yield query.subQuery('create-working-dir')).frame['dir'];
        if (!dir)
            return query.respond(__1.error("couldn't find a working directory"));
        __1.print(`running 'git clone' in ${dir}`);
        yield utils_1.exec(`git clone ${repoUrl}`, {
            cwd: dir
        });
        query.respond({ dir });
    }));
}
exports.default = default_1;
//# sourceMappingURL=git-checkout.js.map