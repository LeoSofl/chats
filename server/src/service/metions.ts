import { IMentions, Mentions } from "../models/Metions";

export type addOrUpdateMentionArgs = Partial<Omit<IMentions, '_id'>>;

export const addOrUpdateMention = async (mention: addOrUpdateMentionArgs) => {
    const filter = {
        roomId: mention.roomId,
        mentionedUser: mention.mentionedUser
    };

    const update = {
        $set: mention
    };

    try {
        const newMention = await Mentions.updateOne(filter, update, { upsert: true });
        return {
            upsertedId: newMention.upsertedId,
            modifiedCount: newMention.modifiedCount,
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface deleteMentionArgs {
    roomId: string;
    mentionedUser: string;
}

export const deleteMention = async ({ roomId, mentionedUser }: deleteMentionArgs) => {
    try {
        const result = await Mentions.deleteOne({ roomId, mentionedUser });
        return result.deletedCount;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface getMentionsArgs {
    roomId: string;
    mentionedUser: string;
}

export const getMentions = async ({ roomId, mentionedUser }: getMentionsArgs) => {
    try {
        const mentions = await Mentions.find({ roomId, mentionedUser });
        return mentions;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface getUserUnreadMentionsArgs {
    userId: string;
}
export const getUserUnreadMentions = async ({ userId }: getUserUnreadMentionsArgs) => {
    try {
        const mentions = await Mentions.find({ mentionedUser: userId, isRead: false });
        return mentions;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export interface setUserMentionAsReadArgs {
    userId: string;
    roomId: string;
}
export const setUserMentionAsRead = async ({ userId, roomId }: setUserMentionAsReadArgs) => {
    try {
        const result = await Mentions.updateMany({ mentionedUser: userId, roomId }, { $set: { isRead: true } });
        return result.modifiedCount;
    } catch (error) {
        console.error(error);
        return null;
    }
}


