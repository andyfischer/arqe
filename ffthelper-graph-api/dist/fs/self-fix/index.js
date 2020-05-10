"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandsIndex_1 = __importDefault(require("./commandsIndex"));
const queryWatcherIndex_1 = __importDefault(require("./queryWatcherIndex"));
async function main() {
    await commandsIndex_1.default();
    await queryWatcherIndex_1.default();
}
main()
    .catch(console.error);
