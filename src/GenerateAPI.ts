
import Graph from './Graph'
import Fs from 'fs'
import GenerateAPIAPI from './GenerateAPIAPI'

function javascriptTemplate(vars) {
    return (
`import Graph from './Graph'
import Relation from './Relation'

export default class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
${vars.methodSource}
}
`);
}

class JavascriptCodeWriter {
    out: (s: string) => void

    needsNewline = false
    inputsNeedComma = false
    indentLevel: number

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
            this.out('    ')

        this.needsNewline = true;
    }

    startFunction(funcName: string, outputType: string | null, writeInputs: (writer: JavascriptCodeWriter) => void) {
        this.writeLine()
        this.startNewLine()
        this.out(funcName);

        this.out('(')
        writeInputs(this)
        this.inputsNeedComma = false;
        this.out(')')
        if (outputType) {
            this.out(': ')
            this.out(outputType);
        }
        this.out(' {')
        this.indentLevel += 1;
    }

    writeInput(name: string, typeName?: string) {
        if (this.inputsNeedComma)
            this.out(', ')

        this.out(name);

        if (typeName) {
            this.out(': ')
            this.out(typeName);
        }

        this.inputsNeedComma = true;
    }

    finishFunction() {
        this.indentLevel -= 1;
        this.startNewLine()
        this.out('}')
    }

    writeLine(line: string = '') {
        this.startNewLine()
        this.out(line);
    }
}

export class APIGenerator {
    graph: Graph
    api: GenerateAPIAPI

    constructor(graph: Graph) {
        this.graph = graph;
        this.api = new GenerateAPIAPI(graph);
    }

    generateMethods(writer: JavascriptCodeWriter) {
        const verboseLogging = this.api.enableVerboseLogging();

        writer.startFunction('run', null, w => w.writeInput('command', 'string'));

        if (verboseLogging)
            writer.writeLine(`console.log('Running command: ' + command);`);

        writer.writeLine('this.graph.run(command);')
        writer.finishFunction()

        for (const touchpoint of this.api.listTouchpoints()) {

            const name = this.api.touchpointFunctionName(touchpoint);
            const expectOne = this.api.touchpointExpectOne(touchpoint);
            const outputValue = this.api.touchpointOutputIsValue(touchpoint);
            const outputExists = this.api.touchpointOutputIsExists(touchpoint);
            const tagValueOutputs = this.graph.getRelationsSync(`${touchpoint} output tagValue/*`);
            const tagOutputs = this.graph.getRelationsSync(`${touchpoint} output tag/*`);
            const outputType = this.graph.getOneRelationOptionalSync(`${touchpoint} output type/*`);

            let outputTypeStr = null;

            if (outputValue) {
                if (outputExists) {
                    outputTypeStr = 'boolean'
                } else {
                    if (outputType) {
                        outputTypeStr = 'number'
                    } else {
                        outputTypeStr = 'string'
                    }

                    if (!expectOne)
                        outputTypeStr += '[]'
                }
            }

            writer.startFunction(name, outputTypeStr, writer => {
                for (const input of this.graph.getRelationsSync(`${touchpoint} input/*`)) {
                    const name = this.graph.getOneRelationSync(`${input.getTag('input')} name/*`).getTagValue('name')
                    const inputTypeRel = this.graph.getOneRelationOptionalSync(`${input.getTag('input')} type/*`);

                    let inputType = null;
                    if (inputTypeRel)
                        inputType = inputTypeRel.getTagValue('type');

                    writer.writeInput(name, inputType)
                }
            });

            const queryStr = this.graph.getOneRelationSync(`${touchpoint} query`).getValue()
            writer.writeLine(`// Run query search`)
            writer.writeLine(`const queryStr = \`${queryStr}\`;`);

            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Running query (for ${name}): ' + queryStr)`);
            }

            writer.writeLine('const rels: Relation[] = this.graph.getRelationsSync(queryStr);');

            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`)
            }

            if (outputExists) {
                writer.writeLine('return rels.length > 0;');
            } else if (expectOne) {
                writer.writeLine()
                writer.writeLine('// Expect one result')
                writer.writeLine('if (rels.length === 0) {')
                writer.increaseIndent()
                writer.writeLine(`throw new Error("No relation found for: " + queryStr)`)
                writer.decreaseIndent()
                writer.writeLine('}')
                writer.writeLine()
                writer.writeLine('if (rels.length > 1) {')
                writer.increaseIndent()
                writer.writeLine(`throw new Error("Multiple results found for: " + queryStr)`)
                writer.decreaseIndent()
                writer.writeLine('}')
                writer.writeLine()
                
                writer.writeLine('const rel = rels[0];');

                if (outputValue) {
                    writer.writeLine('return rel.getValue();');
                } else if (tagValueOutputs.length > 0) {
                    if (tagValueOutputs.length > 1)
                        throw new Error(`can't handle multiple output tagValue/* entries`)

                    const outputTagType = tagValueOutputs[0].getTagValue('tagValue');
                    writer.writeLine(`return rel.getTagValue("${outputTagType}");`)

                } else {
                    writer.writeLine('// no output')
                }
            } else {
                if (tagValueOutputs.length > 0) {
                    if (tagValueOutputs.length > 1)
                        throw new Error(`can't handle multiple output tagValue/* entries`)

                    const outputTagType = tagValueOutputs[0].getTagValue('tagValue');

                    let returnStr = `return rels.map(rel => rel.getTagValue("${outputTagType}"))`

                    if (outputType) {
                        if (outputType.getTagValue('type') === 'integer') {
                            returnStr += '.map(str => parseInt(str, 10))'
                        }
                    }

                    returnStr += ';'

                    writer.writeLine(returnStr)
                } else if (tagOutputs.length > 0) {
                    if (tagOutputs.length > 1)
                        throw new Error(`can't handle multiple output tag/* entries`)

                    const outputTagType = tagOutputs[0].getTagValue('tag');

                    writer.writeLine(`return rels.map(rel => rel.getTag("${outputTagType}"));`)

                } else {

                    if (outputType && outputType.getTagValue('type') === 'object') {
                        writer.writeLine('return rels.map(rel => ({')
                        writer.increaseIndent()

                        const objectdef = this.graph.getOneRelationSync(`${touchpoint} output objectdef/*`).getTag('objectdef');

                        writer.writeLine('return rels.map(rel => ({')

                        for (const objectField of this.graph.getRelationsSync(`${objectdef} objectfield/*`)) {
                        }

                    } else {
                        writer.writeLine('return rels.map(rel => rel.getValue())')
                    }
                }
            }

            writer.finishFunction()
        }
    }

    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.out = (s) => { methodText.push(s) }

        this.generateMethods(writer);
        
        return javascriptTemplate({
            methodSource: methodText.join('')
        });
    }
}

function writeIfChanges(filename: string, contents: string) {
    const existing = Fs.readFileSync(filename, 'utf8')

    if (contents === existing)
        return false;

    Fs.writeFileSync(filename, contents);
    return true;
}

export function generateAPI(graph: Graph) {

    console.log('generateAPI starting..');

    const destinationFilename = graph.getOneRelationSync('code-generation destination-filename').getValue()


    const generator = new APIGenerator(graph);

    writeIfChanges(destinationFilename, generator.asJavascript());
    console.log('file is up to date: ' + destinationFilename);

    console.log('generateAPI done');
}
