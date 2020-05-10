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
const fs_extra_1 = __importDefault(require("fs-extra"));
const fast_glob_1 = __importDefault(require("fast-glob"));
function by(items, key) {
    const result = {};
    for (const item of items) {
        const k = key(item);
        if (!result[k])
            result[k] = [];
        result[k].push(item);
    }
    return Object.values(result);
}
function where(items, condition) {
    return items.filter(condition);
}
function default_1(snapshot) {
    snapshot.implement('npm-list-installed', (query) => __awaiter(this, void 0, void 0, function* () {
        const out = { items: [] };
        const everyPackageFile = yield fast_glob_1.default("node_modules/**/package.json");
        const everyPackage = [];
        for (const file of everyPackageFile) {
            const packageInfo = JSON.parse(yield fs_extra_1.default.readFile(file, 'utf8'));
            everyPackage.push(packageInfo);
        }
        const byName = by(everyPackage, p => p.name);
    }));
}
exports.default = default_1;
//# sourceMappingURL=npm-list-installed.js.map