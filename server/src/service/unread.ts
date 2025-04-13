import { IUnreadCounter, UnreadCounter } from "../models/Unread";
import { UserRoom } from "../models/UserRoom";

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
        // 1. 找出需要更新的用户IDs
        const roomUsers = await UserRoom.find({ roomId });
        const userIds = roomUsers
            .filter(user => user.userId !== excludeUserId)
            .map(user => user.userId);

        if (userIds.length === 0) return { success: true, updatedCount: 0 };

        // 2. 批量更新所有这些用户的未读计数
        const result = await UnreadCounter.updateMany(
            {
                userId: { $in: userIds },
                roomId
            },
            {
                $inc: { count: 1 },
                $setOnInsert: { firstUnreadMessageId: messageId }
            },
            { upsert: true }
        );

        return {
            success: true,
            updatedCount: result.modifiedCount + result.upsertedCount
        };
    } catch (error) {
        console.error('Error incrementing unread count:', error);
        return { success: false, error };
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
