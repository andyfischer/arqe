import Relation from './Relation';
import { GetOperationOutput } from './GetOperation';
export default class GetRespondRelations implements GetOperationOutput {
    relations: Relation[];
    finished: boolean;
    start(): void;
    relation(rel: Relation): void;
    finish(): void;
}
