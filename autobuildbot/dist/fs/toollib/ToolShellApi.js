"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    async listCliInputs(toolname) {
        const command = `get command-line-tool(${toolname}) cli-input name/*`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTagValue("name"));
    }
    async cliInputIsRequired(toolname, name) {
        const command = `get command-line-tool(${toolname}) cli-input name/* required`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.length > 0;
    }
    async createToolExecution() {
        const command = `set cli-tool-execution/(unique)`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(createToolExecution) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(createToolExecution) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("cli-tool-execution");
    }
    async setCliInput(execId, name, value) {
        const command = `set ${execId} cli-input(${name}) value/(set ${value})`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=ToolShellApi.js.map