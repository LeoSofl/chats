import { IUnreadCounter, UnreadCounter } from "../models/Unread";

export interface getUnreadCountsForUserArgs {
    userId: string;
}

export const getUnreadCountsForUser = async ({ userId }: getUnreadCountsForUserArgs) => {
    const unreadCounts = await UnreadCounter.find({ userId });
    return unreadCounts;
}

export type addOrUpdateUnreadCountArgs = Omit<IUnreadCounter, '_id'>;
export const addOrUpdateUnreadCount = async (unreadCount: addOrUpdateUnreadCountArgs) => {
    try {
        const filter = {
            userId: unreadCount.userId,
            roomId: unreadCount.roomId
        };

        const update = {
            $set: unreadCount
        };

        const newUnreadCount = await UnreadCounter.updateOne(filter, update, { upsert: true });

        return {
            upsertedId: newUnreadCount.upsertedId,
            modifiedCount: newUnreadCount.modifiedCount,
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface incrementUnreadCountArgs {
    roomId: string;
    messageId: string;
    excludeUserId?: string;
}

export const incrementUnreadCount = async ({ roomId, messageId, excludeUserId }: incrementUnreadCountArgs) => {
    try {
        const unreadCount = await UnreadCounter.updateMany(
            { roomId, userId: { $ne: excludeUserId } },
            {
                $inc: { count: 1 },
                $setOnInsert: { firstUnreadMessageId: messageId }
            },
            { upsert: true }
        );

        return {
            upsertedId: unreadCount.upsertedId,
            modifiedCount: unreadCount.modifiedCount,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface deleteUnreadCountArgs {
    userId: string;
    roomId: string;
}

export const deleteUnreadCount = async ({ userId, roomId }: deleteUnreadCountArgs) => {
    try {
        const unreadCount = await UnreadCounter.deleteOne({ userId, roomId });
        return unreadCount.deletedCount;
    } catch (error) {
        console.error(error);
        return null;
    }
}

