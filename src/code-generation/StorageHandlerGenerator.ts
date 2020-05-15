
import Graph from '../Graph'
import { startFile, startObjectLiteral, Block, formatBlock, startFunctionTypeDef } from './JavascriptAst'
import StorageHandlerGeneratorAPI from './StorageHandlerGeneratorAPI'
import { writeFileSyncIfUnchanged } from '../context/fs'
import Pattern from '../Pattern'
import parseCommand, { parsePattern } from '../parseCommand'

function createHandlerInterface(api: StorageHandlerGeneratorAPI, file: Block) {
    const handlerInterface = file.addInterface('NativeHandler');

    for (const handler of api.listHandlers()) {
        const functionName = api.touchpointFunctionName(handler);

        const functionType = startFunctionTypeDef();

        for (const { varStr, typeStr } of api.touchpointInputs2(handler)) {
            functionType.addInput(varStr, typeStr);
        }

        const output = api.touchpointOutputWithType(handler);
        if (output) {
            functionType.setOutputType(output);
        }

        handlerInterface.addField(functionName, functionType.line());
    }
}

function createFileAst(api: StorageHandlerGeneratorAPI, target: string) {
    const file = startFile();
    const importPath = api.getIkImport(target);
    file.addImport('{ GraphLike, Relation, Pattern, RelationReceiver }', importPath);

    createHandlerInterface(api, file);

    const apiClass = file.addClass('API');
    apiClass.addField('handler', 'NativeHandler');
    apiClass.isExportDefault = true;

    const contructorFunc = apiClass.contents.addMethod('constructor');
    contructorFunc.addInput('handler', 'NativeHandler');
    contructorFunc.contents.addRaw('this.handler = handler;');

    const handlesPatternMethod = apiClass.contents.addMethod('handlesPattern');
    handlesPatternMethod.addInput('pattern', 'Pattern');
    const handlesPattern = parsePattern(api.getHandlesPattern(target));
    handlesPatternMethod.setOutputType('boolean');
    const handlesPatternIf = handlesPatternMethod.contents.addIf();
    handlesPatternIf.setCondition(patternCheckExpression(handlesPattern));
    handlesPatternIf.contents.addRaw('return true;');
    handlesPatternMethod.contents.addRaw('return false;');

    const runSearch = apiClass.contents.addMethod('runSearch');
    runSearch.addInput('pattern', 'Pattern');
    runSearch.addInput('output', 'RelationReceiver');

    const runSave = apiClass.contents.addMethod('runSave');
    runSave.addInput('pattern', 'Pattern');
    runSave.addInput('output', 'RelationReceiver');

    const runDelete = apiClass.contents.addMethod('runDelete');
    runDelete.addInput('pattern', 'Pattern');
    runDelete.addInput('output', 'RelationReceiver');

    for (const handler of api.listHandlers()) {
        const query = api.handlerQuery(handler);
        if (query.startsWith('get ')) {
            addPatternCheck(api, runSearch.contents, handler);
        } else if (query.startsWith('set ')) {
            addPatternCheck(api, runSave.contents, handler);
        } else if (query.startsWith('delete ')) {
            addPatternCheck(api, runDelete.contents, handler);
        } else {
            throw new Error(`don't know how to handle query: ${query}`);
        }
    }

    return file;
}

function patternCheckExpression(pattern: Pattern) {
    const conditions = [];

    if (pattern.hasDoubleStar) {
        conditions.push(`pattern.tagCount() >= ${pattern.tagCount()}`);
    } else {
        conditions.push(`pattern.tagCount() == ${pattern.tagCount()}`);
    }

    for (const tag of pattern.tags) {
        if (tag.doubleStar)
            continue;

        conditions.push(`pattern.hasType("${tag.tagType}")`);
        if (tag.identifier) {
            conditions.push(`pattern.hasValueForType("${tag.tagType}")`);
        } else if (tag.tagValue) {
            conditions.push(`pattern.getTagValue("${tag.tagType}") == "${tag.tagValue}"`);
        }
    }

    return conditions.map(c => `(${c})`).join(' && ');
}

function pullOutVarsFromPattern(pattern: Pattern, block: Block) {

    const vars: string[] = [];

    for (const tag of pattern.tags) {
        if (tag.identifier) {
            block.addRaw(`const ${tag.identifier} = pattern.getTagValue("${tag.tagType}");`);
            vars.push(tag.identifier);
        }
    }

    return vars;
}

function addPatternCheck(api: StorageHandlerGeneratorAPI, block: Block, handler: string) {
    const query = api.handlerQuery(handler);
    const command = parseCommand(query);
    const pattern = command.pattern;

    block.addComment(`check for ${handler} (${query})`);

    const onHit = block.addIf();
    onHit.setCondition(patternCheckExpression(pattern));

    const functionName = api.touchpointFunctionName(handler);

    const vars = pullOutVarsFromPattern(pattern, onHit.contents);
    onHit.contents.addRaw(`this.handler.${functionName}(${vars.join(', ')})`);

    block.addBlank();
}

export function runStorageHandlerGenerator(graph: Graph, target: string) {
    const api = new StorageHandlerGeneratorAPI(graph);
    api.target = target;

    const ast = createFileAst(api, target);
    formatBlock(ast);
    const destinationFilename = api.getDestinationFilename(target)
    writeFileSyncIfUnchanged(destinationFilename, ast.stringify());
    console.log('generated file is up-to-date: ' + destinationFilename);
}
