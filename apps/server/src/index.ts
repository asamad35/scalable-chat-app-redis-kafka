import http from 'http';
import SocketService from './services/sockets';
import { consumeMessages } from './services/kafka';

async function init() {
    const socketService = new SocketService();
    consumeMessages()

    const httpServer = http.createServer();
    const PORT = process.env.PORT || 8000;

    socketService.io.attach(httpServer);
    socketService.initListeners();

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

}
init()