
import Graph from './Graph'
import { writeFileSyncIfUnchanged } from './context/fs'
import DAOGeneratorGeneratedDAO from './DAOGeneratorGeneratedDAO'

function javascriptTemplate(vars) {
    return (
`import { GraphLike, Relation } from '${vars.ikImport}'

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

export class DAOGenerator {
    target: string
    api: DAOGeneratorGeneratedDAO
    destinationFilename: string
    verboseLogging: boolean

    constructor(api: DAOGeneratorGeneratedDAO, target: string) {
        this.api = api;
        this.target = target;

        this.destinationFilename = this.api.getDestinationFilename(this.target)
        this.verboseLogging = this.api.enableVerboseLogging(this.target);
    }
    
    generateFullQuery(writer: JavascriptCodeWriter, touchpoint: string) {
        const queryStr = this.api.touchpointQueryString(touchpoint);
        const name = this.api.touchpointFunctionName(touchpoint);

        const usesOutput = true;

        const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));

        writer.startFunction(name, null, writer => {
            for (const input of inputs) {
                const name = this.api.inputName(input);
                const inputType = this.api.inputType(input);

                if (inputType)
                    writer.writeInput(name, inputType)
            }
        });

        for (const input of inputs) {
            const name = this.api.inputName(input);
            const tagType = this.api.inputTagType(input);
            if (tagType) {
                writer.writeLine(`if (!${name}.startsWith("${tagType}/")) {`);
                writer.increaseIndent();
                writer.writeLine(`throw new Error('Expected "${tagType}/...", saw: ' + ${name});`);
                writer.decreaseIndent();
                writer.writeLine('}')
                writer.writeLine()
            }
        }

        writer.writeLine(`const queryStr = \`${queryStr}\`;`);
        if (usesOutput) {
            writer.writeLine('const rels = this.graph.runSync(queryStr)')
            writer.writeLine('    .filter(rel => !rel.hasType("command-meta"));');
        } else {
            writer.writeLine('this.graph.runSync(queryStr);')
        }
        writer.writeLine();

        this.relationCountGuards(writer, touchpoint);
        this.returnResult(writer, touchpoint);

        writer.finishFunction();
    }

    relationCountGuards(writer: JavascriptCodeWriter, touchpoint: string) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);

        if (expectOne) {
            if (!outputIsOptional)
                writer.writeLine('// Expect one result')

            writer.writeLine('if (rels.length === 0) {')
            writer.increaseIndent()

            if (outputIsOptional)
                writer.writeLine(`return null;`)
            else
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
            writer.writeLine()
        }
    }

    returnOneResult(writer: JavascriptCodeWriter, touchpoint: string) {
        const outputIsValue = this.api.touchpointOutputIsValue(touchpoint);

        if (outputIsValue) {
            writer.writeLine('return rel.getPayload();');
            return;
        }

        const outputObject = this.api.touchpointOutputObject(touchpoint);

        if (outputObject) {
            writer.writeLine();
            writer.writeLine('return {');
            writer.increaseIndent();

            for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                writer.writeLine(`${field}: rel.getTagValue("${tagValue}"),`);
            }
            
            for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                writer.writeLine(`${field}: rel.getTag("${tag}"),`);
            }

            writer.decreaseIndent();
            writer.writeLine('}');
            return;
        }

        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        if (tagValueOutput) {
            writer.writeLine(`return rel.getTagValue("${tagValueOutput}");`)
            return;
        }

        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        if (tagOutput) {
            writer.writeLine(`return rel.getTag("${tagOutput}");`);
            return;
        }

        writer.writeLine('// no output')
    }

    returnResult(writer: JavascriptCodeWriter, touchpoint: string) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);

        if (expectOne)
            return this.returnOneResult(writer, touchpoint);

        writer.writeLine('// TODO - handle multi results')
    }

    sortInputs(inputs: string[]) {
        if (inputs.length < 2)
            return inputs;

        inputs.sort();

        const entries = inputs.map(input => {

            const out = {
                input
            }

            const sortOrder = this.api.inputSortOrder(input);

            return {
                input,
                sortOrder: sortOrder ? parseFloat(sortOrder) : 0
            }
        });

        entries.sort((a,b) => 
            a.sortOrder - b.sortOrder
        );

        return entries.map(entry => entry.input);
    }

    generateMethod(writer: JavascriptCodeWriter, touchpoint: string) {

        const queryStr = this.api.touchpointQueryString(touchpoint);

        if (!queryStr)
            throw new Error(`couldn't find query for: ` + touchpoint);

        if (queryStr.startsWith('get ')
                || queryStr.startsWith('set ')
                || queryStr.startsWith('delete ')) {
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

        let outputTypeStr = null;

        if (outputExists) {
            outputTypeStr = 'boolean'
        } else {
            if (outputType) {
                outputTypeStr = outputType;
            } else if (outputObject) {
                outputTypeStr = null;
            } else {
                outputTypeStr = 'string'
            }

            if (!expectOne && outputTypeStr !== null)
                outputTypeStr += '[]'
        }

        writer.startFunction(name, outputTypeStr, writer => {

            const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));

            for (const input of inputs) {
                const name = this.api.inputName(input);
                const inputType = this.api.inputType(input);

                if (inputType)
                    writer.writeInput(name, inputType)
            }
        });

        writer.writeLine(`const command = \`get ${queryStr}\`;`);

        if (this.verboseLogging) {
            writer.writeLine();
            writer.writeLine(`console.log('Running query (for ${name}): ' + command)`);
        }

        writer.writeLine(`const rels: Relation[] = this.graph.runSync(command)`);
        writer.writeLine('    .filter(rel => !rel.hasType("command-meta"));');
        

        if (this.verboseLogging) {
            writer.writeLine();
            writer.writeLine(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`)
        }

        if (outputExists) {
            writer.writeLine('return rels.length > 0;');
        } else if (expectOne) {
            writer.writeLine()

            if (!outputIsOptional)
                writer.writeLine('// Expect one result')

            writer.writeLine('if (rels.length === 0) {')
            writer.increaseIndent()

            if (outputIsOptional)
                writer.writeLine(`return null;`)
            else
                writer.writeLine(`throw new Error("No relation found for: " + command)`)

            writer.decreaseIndent()
            writer.writeLine('}')
            writer.writeLine()
            writer.writeLine('if (rels.length > 1) {')
            writer.increaseIndent()
            writer.writeLine(`throw new Error("Multiple results found for: " + command)`)
            writer.decreaseIndent()
            writer.writeLine('}')
            writer.writeLine()
            
            writer.writeLine('const rel = rels[0];');

            if (outputIsValue) {
                writer.writeLine('return rel.getPayload();');
            } else if (outputObject) {
                writer.writeLine();
                writer.writeLine('return {');
                writer.increaseIndent();

                for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                    writer.writeLine(`${field}: rel.getTagValue("${tagValue}"),`);
                }
                
                for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                    writer.writeLine(`${field}: rel.getTag("${tag}"),`);
                }

                writer.decreaseIndent();
                writer.writeLine('}');

            } else if (tagValueOutput) {
                writer.writeLine(`return rel.getTagValue("${tagValueOutput}");`)
            } else if (tagOutput) {
                writer.writeLine(`return rel.getTag("${tagOutput}");`)

            } else {
                writer.writeLine('// no output')
            }
        } else {
            if (tagValueOutput) {
                let returnStr = `return rels.map(rel => rel.getTagValue("${tagValueOutput}"))`

                if (outputType === 'integer') {
                    returnStr += '.map(str => parseInt(str, 10))'
                }

                returnStr += ';'

                writer.writeLine(returnStr)
            } else if (outputObject) {

                writer.writeLine();
                writer.writeLine('return rels.map(rel => ({');
                writer.increaseIndent();

                for (const { field, tagValue } of this.api.outputObjectFields(outputObject)) {
                    writer.writeLine(`${field}: rel.getTagValue("${tagValue}"),`);
                }

                writer.decreaseIndent();
                writer.writeLine('}));');

            } else if (tagOutput) {
                writer.writeLine(`return rels.map(rel => rel.getTag("${tagOutput}"));`)

            } else {

                if (outputType === 'object') {
                    writer.writeLine('return rels.map(rel => ({')
                    writer.increaseIndent()

                    const objectdef = this.api.getOutputObjectdef(touchpoint);

                    writer.writeLine('return rels.map(rel => ({')

                    for (const objectField of this.api.getObjectdefFields(objectdef)) {
                    }

                } else {
                    writer.writeLine('return rels.map(rel => rel.getPayload())')
                }
            }
        }

        writer.finishFunction()
    }

    generateMethods(writer: JavascriptCodeWriter) {

        for (const touchpoint of this.api.listTouchpoints(this.target)) {
            this.generateMethod(writer, touchpoint);
        }
    }

    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.out = (s) => { methodText.push(s) }

        this.generateMethods(writer);
        
        return javascriptTemplate({
            ikImport: this.api.getIkImport(this.target),
            methodSource: methodText.join('')
        });
    }
}

export function generateAPI(graph: Graph, target: string) {

    const api = new DAOGeneratorGeneratedDAO(graph);

    const generator = new DAOGenerator(api, target);

    writeFileSyncIfUnchanged(generator.destinationFilename, generator.asJavascript());
    console.log('generated file is up-to-date: ' + generator.destinationFilename);
}
