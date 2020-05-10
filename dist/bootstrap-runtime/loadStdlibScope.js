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
const bootstrapPrimitives_1 = __importDefault(require("./bootstrapPrimitives"));
function loadFile(scope, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const contents = yield fs_extra_1.default.readFile(filename, 'utf8');
    });
}
function loadStdlibScope(scope) {
    return __awaiter(this, void 0, void 0, function* () {
        bootstrapPrimitives_1.default(scope);
        yield loadFile(scope, `${__dirname}/../../data/_bootstrap.p`);
        return scope;
    });
}
exports.default = loadStdlibScope;
//# sourceMappingURL=loadStdlibScope.js.map