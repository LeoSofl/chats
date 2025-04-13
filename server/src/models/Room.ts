import mongoose from 'mongoose';

export interface IRoom {
  name: string;
  participants: string[];
  lastActivity: Date;
}

const RoomSchema = new mongoose.Schema<IRoom>({
  name: { type: String, required: true },
  participants: [String],
  lastActivity: { type: Date, default: Date.now }
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema); 