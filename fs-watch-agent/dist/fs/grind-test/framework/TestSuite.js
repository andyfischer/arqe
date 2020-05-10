"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = __importDefault(require("./TestRunner"));
const ChaosModes_1 = require("./ChaosModes");
class TestSuite {
    constructor() {
        this.testRunners = [];
        this.test = (name, impl) => {
            for (const runner of this.testRunners) {
                let testName = name;
                if (runner.chaosMode) {
                    testName += ` (${runner.chaosMode.shortDescription})`;
                }
                it(testName, () => impl({
                    run: runner.run
                }));
            }
        };
        this.testRunners.push(new TestRunner_1.default(this));
        if (!process.env.MIN_CHAOS) {
            this.testRunners.push(new TestRunner_1.default(this, ChaosModes_1.ReparseCommand));
            this.testRunners.push(new TestRunner_1.default(this, ChaosModes_1.InsertExtraTag));
            this.testRunners.push(new TestRunner_1.default(this, ChaosModes_1.GetInheritedBranch));
            this.testRunners.push(new TestRunner_1.default(this, ChaosModes_1.ScrambleTagOrder));
        }
    }
    describe(name, impl) {
        describe(name, () => impl(this));
    }
}
exports.default = TestSuite;
function startSuite() {
    return new TestSuite();
}
exports.startSuite = startSuite;
//# sourceMappingURL=TestSuite.js.map