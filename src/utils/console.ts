
import AnsiColorWriter, { ansi_yellow, ansi_red } from './AnsiColorWriter'
import { tokenizeString, t_ident, t_colon } from '../query/tokenizer'

export function consoleColorizeOutput(str) {
    const { reader } = tokenizeString(str);
    const writer = new AnsiColorWriter();

    while (!reader.finished()) {

        if (reader.nextIs(t_ident)
                && reader.nextText() === 'warning'
                && reader.nextIs(t_colon, 1)) {

            reader.consume();
            reader.consume();
            writer.setFG(ansi_yellow);
            writer.write('warning:');
            writer.reset();
            continue;
        }

        if (reader.nextIs(t_ident)
                && reader.nextText() === 'error'
                && reader.nextIs(t_colon, 1)) {

            reader.consume();
            reader.consume();
            writer.setFG(ansi_red);
            writer.write('error:');
            writer.reset();
            continue;
        }

        writer.write(reader.nextText());
        reader.consume();
    }

    return writer.finish()
}
