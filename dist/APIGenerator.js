"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const GenerateAPIAPI_1 = __importDefault(require("./GenerateAPIAPI"));
function javascriptTemplate(vars) {
    return (`import Graph from './Graph'
import Relation from './Relation'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
${vars.methodSource}
}
`);
}
class JavascriptCodeWriter {
    constructor() {
        this.needsNewline = false;
        this.inputsNeedComma = false;
    }
    increaseIndent() {
        this.indentLevel += 1;
    }
    decreaseIndent() {
        this.indentLevel -= 1;
    }
    startNewLine() {
        if (this.needsNewline)
            this.out('\n');
        for (let i = 0; i < this.indentLevel; i++)
            this.out('    ');
        this.needsNewline = true;
    }
    startFunction(funcName, outputType, writeInputs) {
        this.writeLine();
        this.startNewLine();
        this.out(funcName);
        this.out('(');
        writeInputs(this);
        this.inputsNeedComma = false;
        this.out(')');
        if (outputType) {
            this.out(': ');
            this.out(outputType);
        }
        this.out(' {');
        this.indentLevel += 1;
    }
    writeInput(name, typeName) {
        if (this.inputsNeedComma)
            this.out(', ');
        this.out(name);
        if (typeName) {
            this.out(': ');
            this.out(typeName);
        }
        this.inputsNeedComma = true;
    }
    finishFunction() {
        this.indentLevel -= 1;
        this.startNewLine();
        this.out('}');
    }
    writeLine(line = '') {
        this.startNewLine();
        this.out(line);
    }
}
class APIGenerator {
    constructor(graph) {
        this.graph = graph;
        this.api = new GenerateAPIAPI_1.default(graph);
    }
    generateMethods(writer) {
        const verboseLogging = this.api.enableVerboseLogging();
        writer.startFunction('run', null, w => w.writeInput('command', 'string'));
        if (verboseLogging)
            writer.writeLine(`console.log('Running command: ' + command);`);
        writer.writeLine('this.graph.run(command);');
        writer.finishFunction();
        for (const touchpoint of this.api.listTouchpoints()) {
            const name = this.api.touchpointFunctionName(touchpoint);
            const expectOne = this.api.touchpointExpectOne(touchpoint);
            const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);
            const outputValue = this.api.touchpointOutputIsValue(touchpoint);
            const outputExists = this.api.touchpointOutputIsExists(touchpoint);
            const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
            const tagOutput = this.api.touchpointTagOutput(touchpoint);
            const outputType = this.graph.getOneRelationOptionalSync(`${touchpoint} output type/*`);
            let outputTypeStr = null;
            if (outputValue) {
                if (outputExists) {
                    outputTypeStr = 'boolean';
                }
                else {
                    if (outputType) {
                        outputTypeStr = 'number';
                    }
                    else {
                        outputTypeStr = 'string';
                    }
                    if (!expectOne)
                        outputTypeStr += '[]';
                }
            }
            writer.startFunction(name, outputTypeStr, writer => {
                for (const input of this.graph.getRelationsSync(`${touchpoint} input/*`)) {
                    const name = this.graph.getOneRelationSync(`${input.getTag('input')} name/*`).getTagValue('name');
                    const inputTypeRel = this.graph.getOneRelationOptionalSync(`${input.getTag('input')} type/*`);
                    let inputType = null;
                    if (inputTypeRel)
                        inputType = inputTypeRel.getTagValue('type');
                    writer.writeInput(name, inputType);
                }
            });
            const queryStr = this.graph.getOneRelationSync(`${touchpoint} query`).getValue();
            writer.writeLine(`// Run query search`);
            writer.writeLine(`const queryStr = \`${queryStr}\`;`);
            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Running query (for ${name}): ' + queryStr)`);
            }
            writer.writeLine('const rels: Relation[] = this.graph.getRelationsSync(queryStr);');
            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`);
            }
            if (outputExists) {
                writer.writeLine('return rels.length > 0;');
            }
            else if (expectOne) {
                writer.writeLine();
                if (!outputIsOptional)
                    writer.writeLine('// Expect one result');
                writer.writeLine('if (rels.length === 0) {');
                writer.increaseIndent();
                if (outputIsOptional)
                    writer.writeLine(`return null;`);
                else
                    writer.writeLine(`throw new Error("No relation found for: " + queryStr)`);
                writer.decreaseIndent();
                writer.writeLine('}');
                writer.writeLine();
                writer.writeLine('if (rels.length > 1) {');
                writer.increaseIndent();
                writer.writeLine(`throw new Error("Multiple results found for: " + queryStr)`);
                writer.decreaseIndent();
                writer.writeLine('}');
                writer.writeLine();
                writer.writeLine('const rel = rels[0];');
                if (outputValue) {
                    writer.writeLine('return rel.getValue();');
                }
                else if (tagValueOutput) {
                    writer.writeLine(`return rel.getTagValue("${tagValueOutput}");`);
                }
                else {
                    writer.writeLine('// no output');
                }
            }
            else {
                if (tagValueOutput) {
                    let returnStr = `return rels.map(rel => rel.getTagValue("${tagValueOutput}"))`;
                    if (outputType) {
                        if (outputType.getTagValue('type') === 'integer') {
                            returnStr += '.map(str => parseInt(str, 10))';
                        }
                    }
                    returnStr += ';';
                    writer.writeLine(returnStr);
                }
                else if (tagOutput) {
                    writer.writeLine(`return rels.map(rel => rel.getTag("${tagOutput}"));`);
                }
                else {
                    if (outputType && outputType.getTagValue('type') === 'object') {
                        writer.writeLine('return rels.map(rel => ({');
                        writer.increaseIndent();
                        const objectdef = this.graph.getOneRelationSync(`${touchpoint} output objectdef/*`).getTag('objectdef');
                        writer.writeLine('return rels.map(rel => ({');
                        for (const objectField of this.graph.getRelationsSync(`${objectdef} objectfield/*`)) {
                        }
                    }
                    else {
                        writer.writeLine('return rels.map(rel => rel.getValue())');
                    }
                }
            }
            writer.finishFunction();
        }
    }
    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.out = (s) => { methodText.push(s); };
        this.generateMethods(writer);
        return javascriptTemplate({
            methodSource: methodText.join('')
        });
    }
}
exports.APIGenerator = APIGenerator;
function writeIfChanges(filename, contents) {
    const existing = fs_1.default.readFileSync(filename, 'utf8');
    if (contents === existing)
        return false;
    fs_1.default.writeFileSync(filename, contents);
    return true;
}
function generateAPI(graph) {
    console.log('generateAPI starting..');
    const destinationFilename = graph.getOneRelationSync('code-generation destination-filename').getValue();
    const generator = new APIGenerator(graph);
    writeIfChanges(destinationFilename, generator.asJavascript());
    console.log('file is up to date: ' + destinationFilename);
    console.log('generateAPI done');
}
exports.generateAPI = generateAPI;
//# sourceMappingURL=APIGenerator.js.map