import { ReactNode } from "react";

// 消息时间格式化
export const formatMessageTime = (timestamp?: string): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    // 当天显示时间，非当天显示日期+时间
    if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' +
            date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
};

