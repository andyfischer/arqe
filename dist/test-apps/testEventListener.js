"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runStandardProcess_1 = __importDefault(require("../toollib/runStandardProcess"));
const TestEventHandlerAPI_1 = __importDefault(require("./TestEventHandlerAPI"));
runStandardProcess_1.default(async (graph) => {
    const api = new TestEventHandlerAPI_1.default(graph);
    api.eventListener(evt => {
        console.log('received: ', evt);
    });
    await new Promise(() => { });
});
//# sourceMappingURL=testEventListener.js.map