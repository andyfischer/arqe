import Slot from './Slot';
export default interface SlotReceiver {
    slot: (slot: Slot) => void;
    finish: () => void;
}
