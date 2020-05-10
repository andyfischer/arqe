import Command from './Command';
import { RespondFunc } from './Graph';
import Relation from './Relation';
declare type Flow = 'continue' | 'done';
export default interface GraphPlugin {
    name: string;
    onSet?: (command: Command, respond: RespondFunc) => void | Flow;
    afterRelationUpdated?: (command: Command, rel: Relation) => void;
}
export {};
