"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IDSource_1 = __importDefault(require("./utils/IDSource"));
class ObjectSpace {
    constructor(name) {
        this.objects = new Map();
        this.attributes = new Map();
        this.name = name;
        this.idSource = new IDSource_1.default(name + '-');
    }
    nextId() {
        return this.idSource.take();
    }
    defineAttribute(name) {
        this.attributes.set(name, true);
    }
    hasObject(id) {
        return this.objects.has(id);
    }
    object(id) {
        return this.objects.get(id);
    }
    createObject(id) {
        this.objects.set(id, this.objects.get(id) || {
            id,
            attrs: {}
        });
        return this.objects.get(id);
    }
    getExistingObject(id) {
        return this.objects.get(id);
    }
}
exports.default = ObjectSpace;
class ObjectTypeSpace {
    constructor(graph) {
        this.columns = new Map();
        this.graph = graph;
    }
    hasColumn(name) {
        return this.columns.has(name);
    }
    column(name) {
        return this.columns.get(name);
    }
    maybeInitEntityColumn(name) {
        if (!this.columns.has(name)) {
            this.columns.set(name, new ObjectSpace(name));
        }
    }
    onRelationCreated(rel) {
        const columnName = rel.getTagValue('object-type');
        this.maybeInitEntityColumn(columnName);
        if (rel.hasType('attribute')) {
            const attr = rel.getTagValue('attribute');
            this.columns.get(columnName).defineAttribute(attr);
        }
    }
    onRelationUpdated(rel) {
    }
    onRelationDeleted(rel) {
        console.log('warning: ObjectColumnsSpace does not support relation deletion');
    }
}
exports.ObjectTypeSpace = ObjectTypeSpace;
//# sourceMappingURL=ObjectSpace.js.map