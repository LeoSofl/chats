import { Room } from "../models/Room";

export interface getRoomArgs {
    name: string;
}
export const getRoom = async ({ name }: getRoomArgs) => {
    const room = await Room.findOne({ name });
    return room;
}

export interface addRoomArgs {
    name: string;
    lastActivity?: Date;
}
export const addOrUpdateRoom = async ({ name, lastActivity }: addRoomArgs) => {
    try {
        const room = await Room.updateOne({ name }, { $set: { lastActivity } }, { upsert: true });
        return {
            upsertedId: room.upsertedId,
            modifiedCount: room.modifiedCount,
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface deleteRoomArgs {
    name: string;
}
export const deleteRoom = async ({ name }: deleteRoomArgs) => {
    try {
        const result = await Room.deleteOne({ name });
        return result.deletedCount;
    } catch (error) {
        console.error(error);
        return null;
    }
}