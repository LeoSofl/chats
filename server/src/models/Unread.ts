import mongoose from "mongoose";

export interface IUnreadCounter {
    _id: mongoose.Types.ObjectId;
    userId: string;                     // 用户ID
    roomId: string;                     // 房间ID
    count: number;                      // 未读数量
    lastReadTimestamp: Date;            // 最后阅读时间
    firstUnreadMessageId?: mongoose.Types.ObjectId; // 第一条未读消息ID
}

const UnreadCounterSchema = new mongoose.Schema<IUnreadCounter>({
    userId: { type: String, required: true },
    roomId: { type: String, required: true, ref: 'Room' },
    count: { type: Number, default: 0 },
    lastReadTimestamp: { type: Date, default: Date.now },
    firstUnreadMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

UnreadCounterSchema.index({ userId: 1, roomId: 1 }, { unique: true });
export const UnreadCounter = mongoose.model<IUnreadCounter>('UnreadCounter', UnreadCounterSchema);

