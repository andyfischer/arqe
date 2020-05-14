
import Graph from '../Graph'
import { startFile, startObjectLiteral, Block, formatBlock, startFunctionTypeDef } from './JavascriptAst'
import StorageHandlerGeneratorAPI from './StorageHandlerGeneratorAPI'
import { writeFileSyncIfUnchanged } from '../context/fs'
import Pattern from '../Pattern'
import parseCommand from '../parseCommand'

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

    const runSearch = apiClass.contents.addMethod('runSearch');
    runSearch.addInput('pattern', 'Pattern');
    runSearch.addInput('output', 'RelationReceiver');

    const runSave = apiClass.contents.addMethod('runSave');
    runSave.addInput('relation', 'Relation');
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

function addPatternCheck(api: StorageHandlerGeneratorAPI, block: Block, handler: string) {
    const query = api.handlerQuery(handler);
    const command = parseCommand(query);

    block.addComment('check for: ' + handler);
    block.addComment(query)
    // block.addComment(patternWithoutIdentifiers.stringify())
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
