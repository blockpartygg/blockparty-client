import socketIO from 'socket.io-client';

class SocketIO {
    constructor() {}

    initialize() {
        this.socket = socketIO('http://10.0.0.151:1337');
        this.socket.on('connect', () => {
            console.log("SocketIO: Event: 'connect': socket.id=" + this.socket.id);
        });
    }
}

io = new SocketIO();

export default io;