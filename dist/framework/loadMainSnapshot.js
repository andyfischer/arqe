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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const framework_1 = require("../framework");
let _mainSnapshot;
function loadMainSnapshot() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_mainSnapshot) {
            const snapshot = new framework_1.Snapshot();
            yield framework_1.loadDataFile(snapshot, `${__dirname}/../../data/_bootstrap.p`);
            for (const script in snapshot.getValue('bootstrapScripts').scripts)
                yield framework_1.loadDataFile(snapshot, `${__dirname}/../../data/${script}`);
            const userEnv = path_1.default.join(os_1.default.homedir(), '.futureshell/env.p');
            yield framework_1.loadDataFile(snapshot, userEnv);
            if (yield fs_extra_1.default.exists('.fshell'))
                yield framework_1.loadDataFile(snapshot, '.fshell');
            _mainSnapshot = snapshot;
        }
        return _mainSnapshot;
    });
}
exports.default = loadMainSnapshot;
//# sourceMappingURL=loadMainSnapshot.js.map