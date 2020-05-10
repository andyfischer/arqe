import GraphPlugin from './GraphPlugin';
import Command from './Command';
import { RespondFunc } from './Graph';
export default class FilesystemPlugin implements GraphPlugin {
    name: string;
    onSet(command: Command, respond: RespondFunc): void;
}
