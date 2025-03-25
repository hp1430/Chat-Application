import { JOIN_CHANNEL } from '../utils/common/eventConstants.js';

export default function messageHandlers(io, socket) {
  socket.on(JOIN_CHANNEL, async function joinChannelHandler(data, cb) {
    const roomId = data.channelId;
    socket.join(roomId);
    console.log('User joined the channel successfully', roomId);
    cb({
      success: true,
      message: 'Successfully joined the channel',
      data: roomId
    });
  });
}
