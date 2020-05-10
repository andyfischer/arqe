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
const utils_1 = require("../utils");
const prompt = ' ~ ';
let promptIsLive = false;
let promptIsRecentlyPrinted = false;
function trimEndline(str) {
    if (str.length > 0 && str[str.length - 1] === '\n')
        return str.slice(0, str.length - 1);
    return str;
}
utils_1.printEvents.on('beforeLog', () => {
    if (promptIsRecentlyPrinted) {
        process.stdout.write('\n');
        promptIsRecentlyPrinted = false;
        setTimeout(() => {
            if (promptIsLive && !promptIsRecentlyPrinted) {
                promptIsRecentlyPrinted = true;
                process.stdout.write(prompt);
            }
        }, 200);
    }
});
utils_1.printEvents.on('afterLog', () => {
});
function onStartedPrompt() {
    promptIsLive = true;
    promptIsRecentlyPrinted = true;
}
function onFinishedPrompt() {
    promptIsLive = false;
    promptIsRecentlyPrinted = false;
}
function nodeRepl(vm) {
    return __awaiter(this, void 0, void 0, function* () {
        function evaluate(line) {
            return __awaiter(this, void 0, void 0, function* () {
                onFinishedPrompt();
                line = trimEndline(line);
                vm.evaluateQuery(line);
                repl.displayPrompt();
                onStartedPrompt();
            });
        }
        function completer(line) {
            return [];
        }
        onStartedPrompt();
        const repl = require('repl').start({
            prompt,
            eval: evaluate,
            completer
        });
    });
}
exports.default = nodeRepl;
//# sourceMappingURL=nodeRepl.js.map