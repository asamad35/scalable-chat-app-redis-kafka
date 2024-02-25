import { Redis } from "ioredis";
import { Server } from "socket.io";

const pub = new Redis({
    host: 'redis-237579ed-samad-bd64.a.aivencloud.com',
    port: 11739,
    password: 'AVNS_HI5U96UksBp4PtE7G-6',
    username: 'default'
})
const sub = new Redis({
    host: 'redis-237579ed-samad-bd64.a.aivencloud.com',
    port: 11739,
    password: 'AVNS_HI5U96UksBp4PtE7G-6',
    username: 'default'
})

class SocketService {
    private _io: Server;

    constructor() {
        console.log('init socket service...')
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });

        sub.subscribe('MESSAGES')
    }
    public initListeners() {
        const io = this._io
        console.log('init socket listeners...')

        io.on('connect', (socket) => {
            console.log('new socket connected', socket.id)
            socket.on('event:message', async ({ message }: { message: string }) => {
                console.log('New message rec', message)
                await pub.publish('MESSAGES', JSON.stringify({ message }))
            })
        });

        sub.on('message', (channel, message) => {
            if (channel === 'MESSAGES') {
                this.io.emit('message', message)
            }
        })

    }
    get io() {
        return this._io;
    }
}

export default SocketService;