import RelationReceiver from './RelationReceiver';
export default function watchAndValidateCommand(commandStr: string, output: RelationReceiver): {
    relation(rel: any): void;
    finish(): void;
};
