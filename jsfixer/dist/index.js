"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./fs");
fs_1.runStandardProcess2('jsfixer', async (graph, api) => {
    const filename = await api.getCliInput('file');
    console.log('filename: ', filename);
});
//# sourceMappingURL=index.js.map