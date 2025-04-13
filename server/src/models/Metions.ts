import mongoose from 'mongoose';

export interface IMentions {
    _id: mongoose.Types.ObjectId;
    roomId: string;
    messageId: mongoose.Types.ObjectId;  // 引用原消息
    mentionedUser: string;              // 被提及的用户
    mentioningUser: string;             // 提及者
    timestamp: Date;                    // 提及时间
    content: string;                    // 消息预览
    isRead: boolean;                    // 是否已读
}

const MetionsSchema = new mongoose.Schema<IMentions>({
    roomId: { type: String, required: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    mentionedUser: { type: String, required: true },
    mentioningUser: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false }
});

MetionsSchema.index({ mentionedUser: 1, isRead: 1 });
MetionsSchema.index({ roomId: 1, mentionedUser: 1 });

export const Mentions = mongoose.model<IMentions>('Mentions', MetionsSchema);
