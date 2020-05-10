"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AnsiColorWriter_1 = __importStar(require("./AnsiColorWriter"));
const lexer_1 = require("../lexer");
function matchPrefix(it, text) {
    if (it.nextIs(lexer_1.t_ident)
        && it.nextText() === text
        && it.nextIs(lexer_1.t_colon, 1)) {
        it.consume();
        it.consume();
        return true;
    }
}
function consoleColorizeOutput(str) {
    const { iterator } = lexer_1.tokenizeString(str);
    const writer = new AnsiColorWriter_1.default();
    while (!iterator.finished()) {
        if (matchPrefix(iterator, 'warning')) {
            writer.setFG(AnsiColorWriter_1.ansi_yellow);
            writer.write('warning:');
            continue;
        }
        if (matchPrefix(iterator, 'error')) {
            writer.setFG(AnsiColorWriter_1.ansi_red);
            writer.write('error:');
            continue;
        }
        if (matchPrefix(iterator, 'note')) {
            if (iterator.nextIs(lexer_1.t_space))
                iterator.consume();
            writer.setFG(AnsiColorWriter_1.ansi_bright_black);
            continue;
        }
        writer.write(iterator.nextText());
        iterator.consume();
    }
    return writer.finish();
}
exports.consoleColorizeOutput = consoleColorizeOutput;
//# sourceMappingURL=colorizeConsoleOutput.js.map