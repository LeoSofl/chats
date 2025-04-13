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
}
export const addRoom = async ({ name }: addRoomArgs) => {
    const room = await Room.create({ name, participants: [] });
    return room;
}

export interface deleteRoomArgs {
    name: string;
}
export const deleteRoom = async ({ name }: deleteRoomArgs) => {
    const result = await Room.deleteOne({ name });
    return result.deletedCount;
}
export interface addRoomParticipantArgs {
    roomId: string;
    participantName: string;
}

export const addRoomParticipant = async ({ roomId, participantName }: addRoomParticipantArgs) => {
    const room = await Room.findOne({ name: roomId });
    if (!room) return;
    room.participants.push(participantName);
    await room.save();
}

export interface getRoomParticipantsArgs {
    roomId: string;
}
export const getRoomParticipants = async ({ roomId }: getRoomParticipantsArgs) => {
    const room = await Room.findOne({ name: roomId });
    if (!room) return [];
    return room?.participants ?? [];
}

export interface deleteRoomParticipantArgs {
    roomId: string;
    participantName: string;
}

export const deleteRoomParticipant = async ({ roomId, participantName }: deleteRoomParticipantArgs) => {
    const room = await Room.findOne({ name: roomId });
    if (!room) return;
    room.participants = room.participants.filter(p => p !== participantName);
    return await room.save();
}