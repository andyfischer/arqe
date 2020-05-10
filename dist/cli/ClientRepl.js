"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repl_1 = __importDefault(require("repl"));
const prompt = '~ ';
function trimEndline(str) {
    if (str.length > 0 && str[str.length - 1] === '\n')
        return str.slice(0, str.length - 1);
    return str;
}
class ClientRepl {
    constructor(graph) {
        this.graph = graph;
        this.waitingForDone = false;
    }
    receive(msg) {
        if (msg === '#start') {
            this.waitingForDone = true;
            return;
        }
        if (msg === '#done') {
            this.waitingForDone = false;
            this.displayPrompt();
            return;
        }
        console.log(' > ' + msg);
        if (!this.waitingForDone)
            this.displayPrompt();
    }
    async eval(line) {
        line = trimEndline(line);
        this.graph.run(line, response => {
            this.receive(response);
        });
    }
    displayPrompt() {
        this.repl.displayPrompt();
    }
    start() {
        this.repl = repl_1.default.start({
            prompt,
            eval: line => this.eval(line)
        });
    }
}
exports.default = ClientRepl;
//# sourceMappingURL=ClientRepl.js.map