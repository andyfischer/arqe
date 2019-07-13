
import AnsiColorWriter, { ansi_yellow, ansi_red, ansi_bright_black } from './AnsiColorWriter'
import { tokenizeString, t_ident, t_colon, t_space } from '../query/tokenizer'

function matchPrefix(reader, text: string) {
    if (reader.nextIs(t_ident)
            && reader.nextText() === text
            && reader.nextIs(t_colon, 1)) {

        reader.consume();
        reader.consume();
        return true;
    }
}

export function consoleColorizeOutput(str) {
    const { reader } = tokenizeString(str);
    const writer = new AnsiColorWriter();

    while (!reader.finished()) {

        if (matchPrefix(reader, 'warning')) {
            writer.setFG(ansi_yellow);
            writer.write('warning:');
            continue;
        }

        if (matchPrefix(reader, 'error')) {
            writer.setFG(ansi_red);
            writer.write('error:');
            continue;
        }

        if (matchPrefix(reader, 'note')) {
            if (reader.nextIs(t_space))
                reader.consume();
            writer.setFG(ansi_bright_black);
            continue;
        }

        writer.write(reader.nextText());
        reader.consume();
    }

    return writer.finish()
}
