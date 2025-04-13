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
}

export interface deleteUnreadCountArgs {
    userId: string;
    roomId: string;
}

export const deleteUnreadCount = async ({ userId, roomId }: deleteUnreadCountArgs) => {
    const unreadCount = await UnreadCounter.deleteOne({ userId, roomId });
    return unreadCount.deletedCount;
}

