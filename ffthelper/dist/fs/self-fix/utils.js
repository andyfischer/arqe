"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
async function listModulesInsideFolder(dir) {
    return (await fs_extra_1.default.readdir(dir))
        .filter(file => file !== 'index.ts')
        .map(file => file.replace(/\.ts$/, ''));
}
exports.listModulesInsideFolder = listModulesInsideFolder;
