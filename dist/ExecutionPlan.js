"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExecutionPlan {
    constructor(graph, command) {
        this.steps = [{
                storage: graph.inMemory
            }];
        let inheritTagTypes = [];
        for (const tag of command.tags) {
            const tagInfo = graph.schema.findTagType(tag.tagType);
            if (tagInfo.inherits) {
                inheritTagTypes.push(tag.tagType);
                this.steps.push({
                    storage: graph.inMemory,
                    subtractTypes: [tag.tagType]
                });
            }
        }
        if (inheritTagTypes.length >= 2) {
            this.steps.push({
                storage: graph.inMemory,
                subtractTypes: inheritTagTypes
            });
        }
    }
    *findAllMatches(pattern) {
    }
    save(command) {
        for (const step of this.steps) {
            return step.storage.save(command);
        }
    }
}
exports.default = ExecutionPlan;
//# sourceMappingURL=ExecutionPlan.js.map