"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let port = 42940;
if (process.env.PORT)
    port = parseInt(process.env.PORT);
exports.default = port;
