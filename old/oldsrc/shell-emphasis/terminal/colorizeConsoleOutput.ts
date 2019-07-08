
import AnsiColorWriter, { ansi_yellow, ansi_red, ansi_bright_black } from './AnsiColorWriter'
import { tokenizeString, t_ident, t_colon, t_space } from '../lexer'

function matchPrefix(it, text: string) {
    if (it.nextIs(t_ident)
            && it.nextText() === text
            && it.nextIs(t_colon, 1)) {

        it.consume();
        it.consume();
        return true;
    }
}

export function consoleColorizeOutput(str) {
    const { iterator } = tokenizeString(str);
    const writer = new AnsiColorWriter();

    while (!iterator.finished()) {

        if (matchPrefix(iterator, 'warning')) {
            writer.setFG(ansi_yellow);
            writer.write('warning:');
            continue;
        }

        if (matchPrefix(iterator, 'error')) {
            writer.setFG(ansi_red);
            writer.write('error:');
            continue;
        }

        if (matchPrefix(iterator, 'note')) {
            if (iterator.nextIs(t_space))
                iterator.consume();
            writer.setFG(ansi_bright_black);
            continue;
        }

        writer.write(iterator.nextText());
        iterator.consume();
    }

    return writer.finish()
}
