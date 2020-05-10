"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = require("./validation");
exports.assertValue = validation_1.assertValue;
function error(message) {
    return { error: message };
}
exports.error = error;
function performedAction(description) {
    return { performed: description };
}
exports.performedAction = performedAction;
function done() {
    return { done: true };
}
exports.done = done;
function isList(val) {
    return !!val.items;
}
exports.isList = isList;
function setInEnvironment(name, value) {
    return {
        setInEnvironment: name,
        value
    };
}
exports.setInEnvironment = setInEnvironment;
//# sourceMappingURL=index.js.map