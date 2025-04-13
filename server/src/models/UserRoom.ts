import mongoose from 'mongoose';

export interface IUserRoom {
    _id: string;
    userId: string;
    roomId: string;
    lastActivity: Date;
    receiveStatus: 'all' | 'notice' | 'none';
    updatedAt: Date;
    createdAt: Date;
    socketId: string;
}

const UserRoomSchema = new mongoose.Schema<IUserRoom>({
    userId: { type: String, required: true },
    roomId: { type: String, required: true },
    lastActivity: { type: Date, default: Date.now },
    receiveStatus: { type: String, enum: ['all', 'notice', 'none'], default: 'notice' },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    socketId: { type: String, required: true }
});

UserRoomSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export const UserRoom = mongoose.model<IUserRoom>('UserRoom', UserRoomSchema); 