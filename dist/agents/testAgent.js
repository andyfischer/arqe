"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = yield __1.loadMainSnapshot();
        snapshot.implementCommand('test-agent-command', (query) => {
        });
        const framework = new __1.AgentFramework({
            name: 'TestAgent',
            snapshot
        });
        yield framework.start();
        __1.print('Launched as service ' + framework.serviceId);
        process.on('SIGINT', () => {
            framework.stop();
        });
    });
}
main()
    .catch(console.error);
//# sourceMappingURL=testAgent.js.map