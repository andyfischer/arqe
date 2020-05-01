
import Graph from '../Graph'
import { writeFileSyncIfUnchanged } from '../context/fs'
import DAOGeneratorGeneratedDAO from './DAOGeneratorGeneratedDAO'
import { startFile, Block, formatBlock } from './JavascriptAst'

interface InputDef {
    name: string
    inputType?: string
}

function sortInputs(api: DAOGeneratorGeneratedDAO, inputs: string[]) {
    if (inputs.length < 2)
        return inputs;

    inputs.sort();

    const entries = inputs.map(input => {

        const out = {
            input
        }

        const sortOrder = api.inputSortOrder(input);

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

function getTouchpointOutputType(api: DAOGeneratorGeneratedDAO, touchpoint: string) {
    const outputExists = api.touchpointOutputIsExists(touchpoint);
    const outputType = api.touchpointOutputType(touchpoint);
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);
    const outputFrom = api.touchpointOutput(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);

    if (api.touchpointIsListener(touchpoint))
        return null;

    if (outputExists)
        return 'boolean';

    let outputTypeStr = null;

    if (outputType) {
        outputTypeStr = outputType;
    } else if (outputObject) {
        outputTypeStr = null;
    } else if (outputFrom) {
        outputTypeStr = 'string'
    }

    if (!expectOne && outputTypeStr !== null)
        outputTypeStr += '[]'

    if (isAsync && outputTypeStr !== null)
        outputTypeStr = `Promise<${outputTypeStr}>`;

    return outputTypeStr;
}

function getTypeForListenerCallback(api: DAOGeneratorGeneratedDAO, touchpoint: string) {
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);

    if (tagValueOutput)
        return `(${tagValueOutput}: string) => void`

    if (tagOutput)
        return `(${tagOutput}: string) => void`

    return `(rel: Relation) => void`
}

function defineMethod(api: DAOGeneratorGeneratedDAO, block: Block, touchpoint: string) {

    const touchpointStyle = api.touchpointStyle(touchpoint);
    if (touchpointStyle === 'eventListener') {
        defineEventListener(api, block, touchpoint);
        return;
    }

    const queryStr = api.touchpointQueryString(touchpoint);

    if (!queryStr)
        throw new Error(`couldn't find query for: ` + touchpoint);

    let command = queryStr;

    if (!queryStr.startsWith('get ')
            && !queryStr.startsWith('set ')
            && !queryStr.startsWith('delete ')
            && !queryStr.startsWith('listen ')) {
        command = 'get ' + queryStr;
    }

    // const verboseLogging = api.enableVerboseLogging(target);
    const name = api.touchpointFunctionName(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputIsOptional = api.touchpointOutputIsOptional(touchpoint);
    const outputIsValue = api.touchpointOutputIsValue(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);
    const outputExists = api.touchpointOutputIsExists(touchpoint);
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);

    const func = block.addMethod(name);

    if (isAsync)
        func.isAsync = true;

    const outputType = getTouchpointOutputType(api, touchpoint);
    if (outputType)
        func.setOutputType(outputType);

    const inputs = sortInputs(api, api.touchpointInputs(touchpoint));

    for (const input of inputs) {
        func.addInput(api.inputName(input), api.inputType(input));
    }

    if (api.touchpointIsListener(touchpoint))
        func.addInput('callback', getTypeForListenerCallback(api, touchpoint));

    func.contents.addRaw(`const command = \`${command}\`;`);
    func.contents.addBlank();

    /*if (verboseLogging) {
        block.addBlank();
        block.addRaw(`console.log('Running query (for ${name}): ' + command)`);
    }*/

    if (api.touchpointIsListener(touchpoint)) {
        methodBodyForListener(api, touchpoint, func.contents);
        return;
    }

    // Fetch relations
    if (isAsync) {
        func.contents.addRaw(`const { receiver, promise } = receiveToRelationListPromise();`);
        func.contents.addRaw(`this.graph.run(command, receiver)`);
        func.contents.addRaw(`const rels: Relation[] = (await promise)`);

    } else {
        func.contents.addRaw(`const rels: Relation[] = this.graph.runSync(command)`);
    }

    func.contents.addRaw('    .filter(rel => !rel.hasType("command-meta"));');

    func.contents.addBlank();

    // Return output
    methodReturnResult(api, touchpoint, func.contents);
}

function defineEventListener(api: DAOGeneratorGeneratedDAO, block: Block, touchpoint: string) {

    const name = api.touchpointFunctionName(touchpoint);
    const func = block.addMethod(name);
    const contents = func.contents;

    func.addInput('handler', '(evt) => void');

    for (const eventType of api.touchpointEventTypes(touchpoint)) {
        const id = api.eventTypeId(eventType);
        contents.addRaw('// ' + eventType);

        contents.addRaw(`this.graph.run("${api.eventTypeQuery(eventType)}", {`);
        contents.addRaw('    relation(rel: Relation) {')

        if (api.eventTypeIsDeletion(eventType)) {
            contents.addRaw(`        if (rel.hasType('command-meta') && rel.hasType('deleted')) {`)
            contents.addRaw(`            handler({ id: "${id}" });`)
            contents.addRaw(`        }`);
        } else {
            contents.addRaw(`        if (rel.hasType('command-meta'))`);
            contents.addRaw(`            return;`);
            contents.addRaw(`        handler({ id: '${id}' });`);
        }

        contents.addRaw(`    },`)
        contents.addRaw(`    finish() { }`)
        contents.addRaw(`});`);
    }
}

function relationOutputExpression(api: DAOGeneratorGeneratedDAO, touchpoint: string) {
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);

    if (tagValueOutput)
        return `rel.getTagValue("${tagValueOutput}")`

    if (tagOutput)
        return `rel.getTag("${tagOutput}")`

    return `rel`;
}

function methodBodyForListener(api: DAOGeneratorGeneratedDAO, touchpoint: string, block: Block) {
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);
    
    block.addRaw('this.graph.run(command, {')
    block.addRaw('    relation(rel: Relation) {')
    block.addRaw(`        if (rel.hasType('command-meta'))`)
    block.addRaw(`            return;`)
    block.addRaw(`        callback(${relationOutputExpression(api, touchpoint)});`)
    block.addRaw(`    },`)
    block.addRaw(`    finish() { }`)
    block.addRaw(`});`);
}

function methodReturnResult(api: DAOGeneratorGeneratedDAO, touchpoint: string, block: Block) {
    const name = api.touchpointFunctionName(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputIsOptional = api.touchpointOutputIsOptional(touchpoint);
    const outputIsValue = api.touchpointOutputIsValue(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);
    const outputExists = api.touchpointOutputIsExists(touchpoint);
    const tagValueOutput = api.touchpointTagValueOutput(touchpoint);
    const tagOutput = api.touchpointTagOutput(touchpoint);
    const outputType = api.touchpointOutputType(touchpoint);

    if (outputExists) {
        block.addRaw('return rels.length > 0;');
        return;
    }
        
    if (expectOne) {
        if (!outputIsOptional)
            block.addRaw('// Expect one result')

        const zeroCheck = block.addIf();
        zeroCheck.setCondition('rels.length === 0');

        if (outputIsOptional)
            zeroCheck.contents.addRaw(`return null;`)
        else
            zeroCheck.contents.addRaw(`throw new Error("No relation found for: " + command)`)

        const multiCheck = block.addIf();
        multiCheck.setCondition('rels.length > 1');
        multiCheck.contents.addRaw('throw new Error("Multiple results found for: " + command)')
        
        block.addRaw('const oneRel = rels[0];');

        if (outputIsValue) {
            block.addRaw('return oneRel.getPayload();');
        } else if (outputObject) {
            block.addRaw('return {');

            for (const { field, tagValue } of api.outputObjectTagValueFields(outputObject)) {
                block.addRaw(`    ${field}: oneRel.getTagValue("${tagValue}"),`);
            }
            
            for (const { field, tag } of api.outputObjectTagFields(outputObject)) {
                block.addRaw(`    ${field}: oneRel.getTag("${tag}"),`);
            }

            block.addRaw('}');

        } else if (tagValueOutput) {
            block.addRaw(`return oneRel.getTagValue("${tagValueOutput}");`)
        } else if (tagOutput) {
            block.addRaw(`return oneRel.getTag("${tagOutput}");`)

        } else {
            block.addRaw('// no output')
        }

        return;
    }

    if (tagValueOutput) {
        let returnStr = `return rels.map(rel => rel.getTagValue("${tagValueOutput}"))`

        if (outputType === 'integer') {
            returnStr += '.map(str => parseInt(str, 10))'
        }

        returnStr += ';'

        block.addRaw(returnStr)
        return;
    }

    if (outputObject) {

        block.addRaw('return rels.map(rel => ({');

        for (const { field, tagValue } of api.outputObjectFields(outputObject)) {
            block.addRaw(`    ${field}: rel.getTagValue("${tagValue}"),`);
        }

        block.addRaw('}));');

        return;
    }
    
    if (tagOutput) {
        block.addRaw(`return rels.map(rel => rel.getTag("${tagOutput}"));`)
        return;
    }

    block.addRaw('// no output?');
}

function createAst(api: DAOGeneratorGeneratedDAO, target: string) {
    const file = startFile();
    const importPath = api.getIkImport(target);
    file.addImport('{ GraphLike, Relation, receiveToRelationListPromise }', importPath);

    const apiClass = file.addClass('API');
    apiClass.isExportDefault = true;
    apiClass.addField('graph', 'GraphLike');

    const contructorFunc = apiClass.contents.addMethod('constructor');
    contructorFunc.addInput('graph', 'GraphLike');
    contructorFunc.contents.addRaw('this.graph = graph;');

    // methods
    for (const touchpoint of api.listTouchpoints(target)) {
        defineMethod(api, apiClass.contents, touchpoint);
    }

    return file;
}

export function runDAOGenerator2(graph: Graph, target: string) {

    const api = new DAOGeneratorGeneratedDAO(graph);
    const ast = createAst(api, target);
    formatBlock(ast);
    const destinationFilename = api.getDestinationFilename(target)
    writeFileSyncIfUnchanged(destinationFilename, ast.stringify());
    console.log('generated file is up-to-date: ' + destinationFilename);
}
