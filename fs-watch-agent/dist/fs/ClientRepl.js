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
    }
    async eval(line) {
        let isFinished = false;
        line = trimEndline(line);
        if (line === '') {
            this.displayPrompt();
            return;
        }
        this.graph.run(line, {
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');
                console.log(' > ' + rel.stringifyRelation());
            },
            finish: () => {
                isFinished = true;
                this.displayPrompt();
            }
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
function startRepl(graph) {
    const repl = new ClientRepl(graph);
    repl.start();
    return repl;
}
exports.startRepl = startRepl;
//# sourceMappingURL=ClientRepl.js.map