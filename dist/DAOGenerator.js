"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./context/fs");
const DAOGeneratorGeneratedDAO_1 = __importDefault(require("./DAOGeneratorGeneratedDAO"));
function javascriptTemplate(vars) {
    return (`import { GraphLike, Relation, receiveToRelationListPromise } from '${vars.ikImport}'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
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
    indent() {
        this.indentLevel += 1;
        return this;
    }
    unindent() {
        this.indentLevel -= 1;
        return this;
    }
    startNewLine() {
        if (this.needsNewline)
            this.writeOut('\n');
        for (let i = 0; i < this.indentLevel; i++)
            this.writeOut('    ');
        this.needsNewline = true;
    }
    defineMethod(opts) {
        this.line();
        this.startNewLine();
        if (opts.isAsync)
            this.writeOut('async ');
        this.writeOut(opts.name);
        this.writeOut('(');
        this.writeOut(opts.inputs.map(input => {
            let str = input.name;
            if (input.inputType)
                str += ': ' + input.inputType;
            return str;
        }).join(', '));
        this.writeOut(')');
        if (opts.outputType) {
            this.writeOut(': ');
            this.writeOut(opts.outputType);
        }
        this.writeOut(' {');
        this.indent();
        return this;
    }
    input(name, typeName) {
        if (this.inputsNeedComma)
            this.writeOut(', ');
        this.writeOut(name);
        if (typeName) {
            this.writeOut(': ');
            this.writeOut(typeName);
        }
        this.inputsNeedComma = true;
    }
    endBlock() {
        this.indentLevel -= 1;
        this.startNewLine();
        this.writeOut('}');
        return this;
    }
    line(line = '') {
        this.startNewLine();
        this.writeOut(line);
        return this;
    }
    If(condition) {
        this.line(`if (${condition}) {`);
        this.indent();
        return this;
    }
    comment(s) {
        this.line(`// ${s}`);
    }
}
class DAOGenerator {
    constructor(api, target) {
        this.api = api;
        this.target = target;
        this.destinationFilename = this.api.getDestinationFilename(this.target);
        this.verboseLogging = this.api.enableVerboseLogging(this.target);
    }
    generateFullQuery(writer, touchpoint) {
        const command = this.api.touchpointQueryString(touchpoint);
        const name = this.api.touchpointFunctionName(touchpoint);
        const usesOutput = true;
        const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));
        const inputDefs = inputs.map(input => ({
            name: this.api.inputName(input),
            inputType: this.api.inputType(input),
        }));
        writer.defineMethod({
            name,
            inputs: inputDefs
        });
        for (const input of inputs) {
            const name = this.api.inputName(input);
            const tagType = this.api.inputTagType(input);
            if (tagType) {
                writer.If(`!${name}.startsWith("${tagType}/")`)
                    .line(`throw new Error('Expected "${tagType}/...", saw: ' + ${name});`)
                    .endBlock()
                    .line();
            }
        }
        writer.line(`const command = \`${command}\`;`);
        this.fetchRels(writer, touchpoint);
        writer.line();
        this.relationCountGuards(writer, touchpoint);
        this.returnResult(writer, touchpoint);
        writer.endBlock();
    }
    relationCountGuards(writer, touchpoint) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);
        if (expectOne) {
            if (!outputIsOptional)
                writer.line('// Expect one result');
            writer.If('rels.length === 0');
            if (outputIsOptional)
                writer.line(`return null;`);
            else
                writer.line(`throw new Error("No relation found for: " + command)`);
            writer.endBlock();
            writer.line();
            writer.If('rels.length > 1')
                .line(`throw new Error("Multiple results found for: " + command)`)
                .unindent()
                .line('}')
                .line()
                .line('const rel = rels[0];')
                .line();
        }
    }
    returnOneResult(writer, touchpoint) {
        const outputIsValue = this.api.touchpointOutputIsValue(touchpoint);
        if (outputIsValue) {
            writer.line('return rel.getPayload();');
            return;
        }
        const outputObject = this.api.touchpointOutputObject(touchpoint);
        if (outputObject) {
            writer.line();
            writer.line('return {');
            writer.indent();
            for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
            }
            for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                writer.line(`${field}: rel.getTag("${tag}"),`);
            }
            writer.unindent();
            writer.line('}');
            return;
        }
        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        if (tagValueOutput) {
            writer.line(`return rel.getTagValue("${tagValueOutput}");`);
            return;
        }
        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        if (tagOutput) {
            writer.line(`return rel.getTag("${tagOutput}");`);
            return;
        }
        writer.comment('no output');
    }
    returnResult(writer, touchpoint) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        if (expectOne)
            return this.returnOneResult(writer, touchpoint);
        writer.line('// TODO - handle multi results');
    }
    sortInputs(inputs) {
        if (inputs.length < 2)
            return inputs;
        inputs.sort();
        const entries = inputs.map(input => {
            const out = {
                input
            };
            const sortOrder = this.api.inputSortOrder(input);
            return {
                input,
                sortOrder: sortOrder ? parseFloat(sortOrder) : 0
            };
        });
        entries.sort((a, b) => a.sortOrder - b.sortOrder);
        return entries.map(entry => entry.input);
    }
    getTouchpointOutputType(touchpoint) {
        const outputExists = this.api.touchpointOutputIsExists(touchpoint);
        const outputType = this.api.touchpointOutputType(touchpoint);
        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const isAsync = this.api.touchpointIsAsync(touchpoint);
        const outputObject = this.api.touchpointOutputObject(touchpoint);
        if (this.api.touchpointIsListener(touchpoint))
            return null;
        if (outputExists)
            return 'boolean';
        let outputTypeStr = null;
        if (outputType) {
            outputTypeStr = outputType;
        }
        else if (outputObject) {
            outputTypeStr = null;
        }
        else if (tagOutput || tagValueOutput) {
            outputTypeStr = 'string';
        }
        if (!expectOne && outputTypeStr !== null)
            outputTypeStr += '[]';
        if (isAsync && outputTypeStr !== null)
            outputTypeStr = `Promise<${outputTypeStr}>`;
        return outputTypeStr;
    }
    startTouchpointMethod(writer, touchpoint) {
        const name = this.api.touchpointFunctionName(touchpoint);
        const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));
        const isAsync = this.api.touchpointIsAsync(touchpoint);
        const inputDefs = inputs.map(input => ({
            name: this.api.inputName(input),
            inputType: this.api.inputType(input),
        }));
        if (this.api.touchpointIsListener(touchpoint))
            inputDefs.push({ name: 'callback', inputType: '(rel: Relation) => void' });
        writer.defineMethod({
            name,
            isAsync,
            outputType: this.getTouchpointOutputType(touchpoint),
            inputs: inputDefs
        });
    }
    fetchRels(writer, touchpoint) {
        const isAsync = this.api.touchpointIsAsync(touchpoint);
        if (isAsync) {
            writer.line(`const { receiver, promise } = receiveToRelationListPromise();`);
            writer.line(`this.graph.run(command, receiver)`);
            writer.line(`const rels: Relation[] = (await promise)`);
        }
        else {
            writer.line(`const rels: Relation[] = this.graph.runSync(command)`);
        }
        writer.line('    .filter(rel => !rel.hasType("command-meta"));');
        if (this.verboseLogging) {
            writer.line();
            writer.line(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`);
        }
    }
    generateMethod(writer, touchpoint) {
        const queryStr = this.api.touchpointQueryString(touchpoint);
        if (!queryStr)
            throw new Error(`couldn't find query for: ` + touchpoint);
        let command = queryStr;
        if (!queryStr.startsWith('get ')
            && !queryStr.startsWith('set ')
            && !queryStr.startsWith('delete ')
            && !queryStr.startsWith('listen ')) {
            command = 'get ' + queryStr;
        }
        if (queryStr.startsWith('delete ')) {
            this.generateFullQuery(writer, touchpoint);
            return;
        }
        const name = this.api.touchpointFunctionName(touchpoint);
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const isAsync = this.api.touchpointIsAsync(touchpoint);
        const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);
        const outputIsValue = this.api.touchpointOutputIsValue(touchpoint);
        const outputObject = this.api.touchpointOutputObject(touchpoint);
        const outputExists = this.api.touchpointOutputIsExists(touchpoint);
        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        const outputType = this.api.touchpointOutputType(touchpoint);
        this.startTouchpointMethod(writer, touchpoint);
        writer.line(`const command = \`${command}\`;`);
        if (this.verboseLogging) {
            writer.line();
            writer.line(`console.log('Running query (for ${name}): ' + command)`);
        }
        if (this.api.touchpointIsListener(touchpoint)) {
            return this.listenerBody(writer, touchpoint);
        }
        this.fetchRels(writer, touchpoint);
        if (outputExists) {
            writer.line('return rels.length > 0;');
        }
        else if (expectOne) {
            writer.line();
            if (!outputIsOptional)
                writer.line('// Expect one result');
            writer.line('if (rels.length === 0) {');
            writer.indent();
            if (outputIsOptional)
                writer.line(`return null;`);
            else
                writer.line(`throw new Error("No relation found for: " + command)`);
            writer.unindent();
            writer.line('}');
            writer.line();
            writer.line('if (rels.length > 1) {');
            writer.indent();
            writer.line(`throw new Error("Multiple results found for: " + command)`);
            writer.unindent();
            writer.line('}');
            writer.line();
            writer.line('const rel = rels[0];');
            if (outputIsValue) {
                writer.line('return rel.getPayload();');
            }
            else if (outputObject) {
                writer.line();
                writer.line('return {');
                writer.indent();
                for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                    writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
                }
                for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                    writer.line(`${field}: rel.getTag("${tag}"),`);
                }
                writer.unindent();
                writer.line('}');
            }
            else if (tagValueOutput) {
                writer.line(`return rel.getTagValue("${tagValueOutput}");`);
            }
            else if (tagOutput) {
                writer.line(`return rel.getTag("${tagOutput}");`);
            }
            else {
                writer.line('// no output');
            }
        }
        else {
            if (tagValueOutput) {
                let returnStr = `return rels.map(rel => rel.getTagValue("${tagValueOutput}"))`;
                if (outputType === 'integer') {
                    returnStr += '.map(str => parseInt(str, 10))';
                }
                returnStr += ';';
                writer.line(returnStr);
            }
            else if (outputObject) {
                writer.line();
                writer.line('return rels.map(rel => ({');
                writer.indent();
                for (const { field, tagValue } of this.api.outputObjectFields(outputObject)) {
                    writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
                }
                writer.unindent();
                writer.line('}));');
            }
            else if (tagOutput) {
                writer.line(`return rels.map(rel => rel.getTag("${tagOutput}"));`);
            }
            else {
                if (outputType === 'object') {
                    writer.line('return rels.map(rel => ({');
                    writer.indent();
                    const objectdef = this.api.getOutputObjectdef(touchpoint);
                    writer.line('return rels.map(rel => ({');
                    for (const objectField of this.api.getObjectdefFields(objectdef)) {
                    }
                }
            }
        }
        writer.endBlock();
    }
    listenerBody(writer, touchpoint) {
        writer.line('this.graph.run(command, {')
            .indent()
            .line('relation(rel: Relation) { callback(rel) },')
            .line('finish() {  }')
            .unindent()
            .line('});');
        writer.endBlock();
    }
    generateMethods(writer) {
        for (const touchpoint of this.api.listTouchpoints(this.target)) {
            this.generateMethod(writer, touchpoint);
        }
    }
    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.writeOut = (s) => { methodText.push(s); };
        this.generateMethods(writer);
        return javascriptTemplate({
            ikImport: this.api.getIkImport(this.target),
            methodSource: methodText.join('')
        });
    }
}
exports.DAOGenerator = DAOGenerator;
function generateAPI(graph, target) {
    const api = new DAOGeneratorGeneratedDAO_1.default(graph);
    const generator = new DAOGenerator(api, target);
    fs_1.writeFileSyncIfUnchanged(generator.destinationFilename, generator.asJavascript());
    console.log('generated file is up-to-date: ' + generator.destinationFilename);
}
exports.generateAPI = generateAPI;
//# sourceMappingURL=DAOGenerator.js.map