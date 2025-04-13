import mongoose from 'mongoose';

export interface IRoom {
  name: string;
  lastActivity: Date;
}

const RoomSchema = new mongoose.Schema<IRoom>({
  name: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now }
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema); 