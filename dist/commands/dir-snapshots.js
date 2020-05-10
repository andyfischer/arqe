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
const __1 = require("..");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
function default_1(snapshot) {
    snapshot.implement('save-dir-snapshot', (query) => __awaiter(this, void 0, void 0, function* () {
        const name = query.get('snapshot-name');
        const snapshotDir = query.get('stored-snapshot-dir');
        const filename = path_1.default.join(snapshotDir, name + '.tar.gz');
        utils_1.print('saving snapshot to: ' + filename);
        yield utils_1.exec(`tar -zcvf ${filename} .`);
        query.respond(__1.performedAction(`saved snapshot to: ${filename}`));
    }));
    snapshot.implement('restore-dir-snapshot', (query) => __awaiter(this, void 0, void 0, function* () {
        const name = query.get('snapshot-name');
        const snapshotDir = query.get('stored-snapshot-dir');
        const filename = path_1.default.join(snapshotDir, name + '.tar.gz');
        utils_1.print('reading snapshot: ' + filename);
        yield utils_1.exec(`tar -xjvf ${filename}`);
        query.respond(__1.performedAction(`extracted snapshot from: ${filename}`));
    }));
}
exports.default = default_1;
//# sourceMappingURL=dir-snapshots.js.map