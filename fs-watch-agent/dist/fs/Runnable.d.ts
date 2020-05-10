import RelationReceiver from './RelationReceiver';
export default interface Runnable {
    run: (command: string, output: RelationReceiver) => void;
}
