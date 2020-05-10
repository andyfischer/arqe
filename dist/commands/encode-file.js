#! /usr/bin/env node
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
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("../utils");
const selfCheck = true;
function getSha1(data) {
    return crypto_1.default.createHash("sha1").update(data).digest("hex");
}
function getFiletype(filename, contents) {
    if (filename.endsWith('.sh'))
        return 'bash-script';
    const str = contents.toString('utf8');
    const usrBin = /\#\! *\/usr\/bin\/env +([a-z]*)/.exec(str);
    switch (usrBin && usrBin[1]) {
        case 'bash':
            return 'bash-script';
    }
    return 'unknown';
}
function default_1(snapshot) {
    snapshot.implement('encode-file', (query) => __awaiter(this, void 0, void 0, function* () {
        const files = process.argv.slice(2);
        if (files.length === 0) {
            utils_1.print('error: no file?');
            return;
        }
        for (const file of files) {
            const basename = path_1.default.basename(file);
            const contents = yield fs_extra_1.default.readFile(file);
            const base64 = contents.toString('base64');
            const sha1 = getSha1(contents);
            const filetype = getFiletype(basename, contents);
            const cmd = `file-contents filename=${basename} filetype=${filetype} sha1=${sha1} base64=${base64}`;
            utils_1.print(cmd);
        }
    }));
}
exports.default = default_1;
//# sourceMappingURL=encode-file.js.map