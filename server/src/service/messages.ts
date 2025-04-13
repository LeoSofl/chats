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

export interface getMessageArgs {
    messageId: string;
}
export const getMessage = async ({ messageId }: getMessageArgs) => {
    const message = await Message.findById(messageId);
    return message;
}


type addMessageArgs = Omit<IMessage, '_id'>;
export const addMessage = async (message: addMessageArgs) => {
    try {
        const newMessage = await Message.create(message);
        return newMessage;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface deleteMessageArgs {
    messageId: string;
}
export const deleteMessage = async ({ messageId }: deleteMessageArgs) => {
    try {
        const result = await Message.deleteOne({ _id: messageId });
        return result.deletedCount;
    } catch (error) {
        console.error(error);
        return null;
    }
}

