import socketIO from 'socket.io-client';

class SocketIO {
    constructor() {}

    initialize() {
        this.socket = socketIO('http://192.168.86.44:1337');
        this.socket.on('connect_error', error => {
            console.log("SocketIO: Event: 'connect_error': error=");
            console.log(error);
        });
        this.socket.on('connect', () => {
            console.log("SocketIO: Event: 'connect': socket.id=" + this.socket.id);
        });
    }
}

io = new SocketIO();

export default io;