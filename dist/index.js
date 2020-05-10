"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Graph_1 = require("./Graph");
exports.Graph = Graph_1.default;
var runStandardProcess_1 = require("./toollib/runStandardProcess");
exports.runStandardProcess = runStandardProcess_1.default;
var runStandardProcess2_1 = require("./toollib/runStandardProcess2");
exports.runStandardProcess2 = runStandardProcess2_1.default;
__export(require("./receivers"));
if (require.main === module) {
    require('./startServer.js');
}
//# sourceMappingURL=index.js.map