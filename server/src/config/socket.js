let io;

export const setIO = (socketInstance) => {
  io = socketInstance;
};
export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
