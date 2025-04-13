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
        // 1. 找出需要更新的用户
        const roomUsers = await UserRoom.find({ roomId });
        const validUsers = roomUsers
            .filter(user => user.userId && typeof user.userId === 'string' && user.userId !== excludeUserId && user.receiveStatus === "notice");

        if (validUsers.length === 0) return { success: true, updatedCount: 0 };

        // 2. 逐个处理每个用户的未读计数
        let updatedCount = 0;
        const errors = [];

        for (const user of validUsers) {
            try {
                // 使用updateOne而不是updateMany
                const result = await UnreadCounter.updateOne(
                    {
                        userId: user.userId,
                        roomId
                    },
                    {
                        $inc: { count: 1 },
                        $setOnInsert: { firstUnreadMessageId: messageId }
                    },
                    { upsert: true }
                );

                if (result.modifiedCount > 0 || result.upsertedCount > 0) {
                    updatedCount++;
                }
            } catch (err) {
                console.warn(`Failed to update unread count for user ${user.userId}:`, err);
                errors.push({ userId: user.userId, error: err });
            }
        }

        return {
            success: true,
            updatedCount,
            errors: errors.length > 0 ? errors : undefined
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
