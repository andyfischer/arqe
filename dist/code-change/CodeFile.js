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
const lexer_1 = require("../lexer");
class CodeFile {
    readFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            this.textContents = yield fs_extra_1.default.readFile(filename, 'utf8');
        });
    }
    saveFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.writeFile(filename, this.getText());
        });
    }
    readString(text) {
        this.textContents = text;
    }
    getText() {
        return this.textContents;
    }
    getLexed() {
        if (!this._lexed) {
            this._lexed = lexer_1.tokenizeString(this.textContents);
        }
        return this._lexed;
    }
    patch(charStart, charEnd, text) {
        this.textContents =
            this.textContents.slice(0, charStart)
                + text
                + this.textContents.slice(charEnd);
        this._lexed = null;
    }
}
exports.default = CodeFile;
//# sourceMappingURL=CodeFile.js.map