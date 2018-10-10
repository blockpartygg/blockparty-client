import socketIO from 'socket.io-client';

class SocketIO {
    constructor() {}

    initialize() {
        // On Heroku, http server port is set dynamically but always listens for connections on default port 80
        let uri = process.env.NODE_ENV === 'production' ? 'http://blockparty-server.herokuapp.com' : 'http://172.20.10.2:1337';
        console.log('attempting to connect to ' + uri);
        this.socket = socketIO(uri);
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