import { UserRoom } from "../models/UserRoom";

export interface AddOrUpdateUserRoomArgs {
    userId: string;
    roomId: string;
    receiveStatus: 'all' | 'notice' | 'none';
}

export const addOrUpdateUserRoom = async (args: AddOrUpdateUserRoomArgs) => {
    const { userId, roomId, receiveStatus } = args;
    const userRoom = await UserRoom.findOne({ userId, roomId });
    if (userRoom) {
        userRoom.receiveStatus = receiveStatus;
        await userRoom.save();
    } else {
        await UserRoom.create({ userId, roomId, receiveStatus });
    }
}

export interface GetUserRoomArgs {
    userId: string;
    roomId: string;
}

export const getUserRoom = async (args: GetUserRoomArgs) => {
    const { userId, roomId } = args;
    const userRoom = await UserRoom.findOne({ userId, roomId });
    return userRoom;
}

export const getRoomUsers = async (roomId: string) => {
    const users = await UserRoom.find({ roomId });
    return users;
}

export interface DeleteUserRoomArgs {
    userId: string;
    roomId: string;
}

export const deleteUserRoom = async (args: DeleteUserRoomArgs) => {
    const { userId, roomId } = args;
    try {
        const result = await UserRoom.deleteOne({ userId, roomId });
        return result.deletedCount;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export interface DeleteUserRoomsArgs {
    userId: string;
}

export const deleteUserRooms = async (args: DeleteUserRoomsArgs) => {
    const { userId } = args;
    try {
        const result = await UserRoom.deleteMany({ userId });
        return result.deletedCount;
    } catch (error) {
        console.error(error);
        return 0;
    }
}
