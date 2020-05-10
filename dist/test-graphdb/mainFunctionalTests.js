"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TestFramework_1 = require("./TestFramework");
function fromScript(script) {
    return (async (session) => {
        return await session.runScript(script);
    });
}
function loadCasesFromFiles() {
    const testDir = __dirname + '/../../src/test-graphdb';
    const files = fs_1.default.readdirSync(testDir);
    return files
        .filter(file => file.endsWith('.txt'))
        .map(file => {
        const filename = path_1.default.join(testDir, file);
        const contents = fs_1.default.readFileSync(filename, 'utf8');
        return fromScript(`-- File: ${file}\n${contents}`);
    });
}
async function testSaveUnique(session) {
    const result = await session.command('set uniquetype/#unique');
    if (typeof result !== 'string') {
        session.fail('expected string from "set uniquetype/#unique", got: ' + result);
        return;
    }
    if (!result.startsWith('set uniquetype/'))
        session.fail('expected "set uniquetype/...", saw: ' + result);
    if (result.indexOf('#unique') !== -1)
        session.fail('expected not to contain "#unique": ' + result);
}
async function testGetConnectionId(session) {
    const result = await session.command('get -x connection/?');
    if (typeof result !== 'string') {
        session.fail('expected string from "get -x connection/?", got: ' + result);
        return;
    }
    if (!result.startsWith('set connection/'))
        session.fail('expected set connection/..., saw: ' + result);
    if (result.indexOf('?') !== -1)
        session.fail('expected not to contain ?: ' + result);
}
const localTests = [
    testSaveUnique,
    testGetConnectionId
];
async function mainFunctionalTests(conn) {
    const suite = new TestFramework_1.TestSuite();
    suite.conn = conn;
    const testCases = loadCasesFromFiles()
        .concat(localTests);
    await suite.runAll(testCases);
    const session = new TestFramework_1.TestSession();
    session.conn = conn;
}
exports.default = mainFunctionalTests;
//# sourceMappingURL=mainFunctionalTests.js.map