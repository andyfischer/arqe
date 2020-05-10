"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Slot_1 = __importDefault(require("./Slot"));
const MissingValue = Symbol('missing');
class Scope {
    constructor(graph) {
        if (!graph)
            throw new Error('missing: graph');
        this.graph = graph;
    }
    createSlot(name) {
        const key = 'slot/' + name;
        if (this.graph.exists(key))
            throw new Error('slot already exists: ' + name);
        const slot = new Slot_1.default();
        slot.empty = true;
        this.graph.insert(key, slot);
        return slot;
    }
    createSlotAndSet(name, initialValue) {
        const slot = this.createSlot(name);
        slot.empty = false;
        slot.value = initialValue;
    }
    getOptional(name, defaultValue) {
        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);
        if (slot && !slot.empty)
            return slot.value;
        return defaultValue;
    }
    get(name) {
        const found = this.getOptional(name, MissingValue);
        if (found === MissingValue)
            throw new Error('value not found for: ' + name);
        return found;
    }
    set(name, value) {
        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);
        if (!slot)
            throw new Error("no slot with name: " + name);
        slot.empty = false;
        slot.value = value;
    }
    modify(name, callback) {
        const key = 'slot/' + name;
        const slot = this.graph.findOne(key, null);
        if (!slot)
            throw new Error("no slot with name: " + name);
        slot.empty = false;
        slot.value = callback(slot.value);
    }
}
exports.default = Scope;
//# sourceMappingURL=Scope.js.map