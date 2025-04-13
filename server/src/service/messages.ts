import { IMessage, Message } from "../models/Message";

interface getRoomMessagesArgs {
    roomId: string;
    limit?: number;
    offset?: number;
}
export const getRoomMessages = async ({ roomId, limit = 50, offset = 0 }: getRoomMessagesArgs): Promise<IMessage[]> => {
    const messages = await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

    return messages.reverse()
}


type addMessageArgs = Omit<IMessage, '_id'>;
export const addMessage = async (message: addMessageArgs) => {
    const newMessage = await Message.create(message);
    return newMessage;
}

export interface deleteMessageArgs {
    messageId: string;
}
export const deleteMessage = async ({ messageId }: deleteMessageArgs) => {
    const result = await Message.deleteOne({ _id: messageId });
    return result.deletedCount;
}

