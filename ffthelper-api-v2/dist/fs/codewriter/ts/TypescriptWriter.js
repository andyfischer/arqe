"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../shared");
const fs_extra_1 = __importDefault(require("fs-extra"));
const stringCoerce_1 = require("../shared/stringCoerce");
class TypescriptWriter {
    constructor() {
        this.out = new shared_1.LineWriter();
    }
    async writeToFile(filename) {
        await fs_extra_1.default.writeFile(filename, `// generated file\n\n` + this.out.getResult());
    }
    lineComment(s) {
        this.out.writeln('// ' + s);
    }
    interface_(i) {
        if (i.isExport)
            this.out.write('export ');
        if (i.isDefaultExport)
            this.out.write('default ');
        this.out.writeln('interface ' + name + ' {');
        this.out.indent();
    }
    interfaceField(f) {
        this.out.write(f.name);
        if (f.optional)
            this.out.write('?');
        this.out.write(': ' + f.typeDecl);
        this.out.endLine();
    }
    import_(symbols, fromPath) {
        this.out.write('import ');
        if (symbols && symbols[0] !== '{')
            symbols = stringCoerce_1.toIdentifier(symbols);
        if (symbols) {
            this.out.write(symbols);
            this.out.write(' from ');
        }
        this.out.write(stringCoerce_1.toQuotedString(fromPath));
        this.out.write(';');
        this.out.endLine();
    }
    line(str) {
        this.out.writeln(str);
    }
    blankLine() {
        this.out.writeln('');
    }
    openBlock(str) {
        this.out.writeln(str);
        this.out.indent();
    }
    closeBlock(str = "}") {
        this.out.unindent();
        this.out.writeln(str);
    }
}
exports.default = TypescriptWriter;
