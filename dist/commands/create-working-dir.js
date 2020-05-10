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
const fs_extra_1 = require("fs-extra");
const utils_1 = require("../utils");
const path_1 = __importDefault(require("path"));
function default_1(snapshot) {
    snapshot.implement('create-working-dir', (query) => __awaiter(this, void 0, void 0, function* () {
        const rootWorkingDir = query.get('filesystem.workingdir');
        const dirName = query.getOptional('dir-name', 'anon');
        const hash = utils_1.randomHex(6);
        const fullDir = path_1.default.join(rootWorkingDir, `${dirName}-${hash}`);
        yield fs_extra_1.mkdirp(fullDir);
        query.respond({ dir: fullDir });
    }));
}
exports.default = default_1;
//# sourceMappingURL=create-working-dir.js.map