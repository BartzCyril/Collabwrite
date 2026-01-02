import { Socket, Server as SocketIOServer } from 'socket.io';

interface UserInRoom {
  socketId: string;
  userId: string;
  userName: string;
}

interface Room {
  id: string;
  users: Map<string, UserInRoom>;
}

const rooms = new Map<string, Room>();
const userRooms = new Map<string, string>();

export function setupWebRTCHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('join-room', ({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) => {
      console.log(`[${new Date().toISOString()}] User ${userName} (${userId}, ${socket.id}) joining audio room ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          users: new Map(),
        });
      }

      const room = rooms.get(roomId)!;
      const existingUsers = Array.from(room.users.values());

      socket.join(roomId);
      room.users.set(socket.id, {
        socketId: socket.id,
        userId,
        userName,
      });
      userRooms.set(socket.id, roomId);

      existingUsers.forEach((existingUser) => {
        socket.emit('user-joined', {
          userId: existingUser.socketId,
          userName: existingUser.userName,
        });
      });

      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userName: userName,
      });

      console.log(`[${new Date().toISOString()}] Audio room ${roomId} now has ${room.users.size} users`);
      console.log(`[${new Date().toISOString()}] Notified ${socket.id} about ${existingUsers.length} existing users`);
    });

    socket.on('leave-room', ({ roomId, userId }: { roomId: string; userId: string }) => {
      console.log(`[${new Date().toISOString()}] User ${userId} (${socket.id}) leaving audio room ${roomId}`);
      leaveRoom(socket, roomId);
    });

    socket.on('offer', ({ to, from, signal }: { to: string; from: string; signal: any }) => {
      console.log(`[${new Date().toISOString()}] Forwarding WebRTC offer from ${from} to ${to}`);
      io.to(to).emit('offer', { from: socket.id, signal });
    });

    socket.on('answer', ({ to, from, signal }: { to: string; from: string; signal: any }) => {
      console.log(`[${new Date().toISOString()}] Forwarding WebRTC answer from ${from} to ${to}`);
      io.to(to).emit('answer', { from: socket.id, signal });
    });

    socket.on('ice-candidate', ({ to, from, candidate }: { to: string; from: string; candidate: any }) => {
      console.log(`[${new Date().toISOString()}] Forwarding ICE candidate from ${from} to ${to}`);
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });
  });
}

function leaveRoom(socket: Socket, roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    room.users.delete(socket.id);
    socket.to(roomId).emit('user-left', { userId: socket.id });
    socket.leave(roomId);
    userRooms.delete(socket.id);

    console.log(`[${new Date().toISOString()}] Audio room ${roomId} now has ${room.users.size} users`);

    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`[${new Date().toISOString()}] Audio room ${roomId} deleted (empty)`);
    }
  }
}

export function handleWebRTCDisconnect(socket: Socket) {
  const roomId = userRooms.get(socket.id);
  if (roomId) {
    leaveRoom(socket, roomId);
  }
}
