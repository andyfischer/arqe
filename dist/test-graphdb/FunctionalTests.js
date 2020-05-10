"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TestFramework_1 = require("./TestFramework");
function fromScript(script) {
    return ((session) => __awaiter(this, void 0, void 0, function* () {
        return yield session.runScript(script);
    }));
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
function testSaveUnique(session) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield session.command('save uniquetype/#unique');
        if (!result.startsWith('save uniquetype/'))
            session.fail('expected "save uniquetype/...", saw: ' + result);
        if (result.indexOf('#unique') !== -1)
            session.fail('expected not to contain "#unique": ' + result);
    });
}
const localTests = [
    testSaveUnique
];
function mainFunctionalTests(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        const suite = new TestFramework_1.TestSuite();
        suite.conn = conn;
        const testCases = loadCasesFromFiles()
            .concat(localTests);
        yield suite.runAll(testCases);
        const session = new TestFramework_1.TestSession();
        session.conn = conn;
    });
}
exports.mainFunctionalTests = mainFunctionalTests;
//# sourceMappingURL=FunctionalTests.js.map