export interface JoinRoomReq {
    roomId: string;
    userName: string;
    options?: {
        fullHistory?: boolean;
        notificationsOnly?: boolean;
    };
}


export const joinRoom = async (req: JoinRoomReq) => {
    const { roomId, options = {} } = data;
    socket.join(roomId);
    console.log(`User ${userName} joined room ${roomId} with options:`, options);

    // 保存用户房间模式状态
    const userState = userConnections.get(socket.id);
    if (userState) {
        userState.rooms.set(roomId, {
            fullHistory: options.fullHistory || false,
            notificationsOnly: options.notificationsOnly || false
        });
    }

    // 更新房间参与者
    await Room.updateOne(
        { name: roomId },
        {
            $addToSet: { participants: { name: userName } },
            $set: { lastActivity: new Date() }
        },
        { upsert: true }
    )
}