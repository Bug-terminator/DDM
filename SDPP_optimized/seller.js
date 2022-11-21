const tls = require('tls');
const fs = require('fs');
const PORT = 1234;
const HOST = 'localhost'
const options = {
    key: fs.readFileSync('private-key'),
    cert: fs.readFileSync('public-cert'),
    rejectUnauthorized: false
};

const server = tls.createServer(options, function (socket) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`new client connected: ${clientAddress}`);
    // Send a friendly message 
    socket.write("I am the server sending you a message.");
    // Print the data that we received 
    socket.on('data', (data) => {
        console.log(`Received:${data.toString()}`)
    });
    // Let us know when the transmission is over 
    socket.on('end', function () {
        console.log('EOT (End Of Transmission)');
    });
    socket.on('error', () => console.log('error'));
});
// Start listening on a specific port and address 
server.listen(PORT, HOST, function () {
    console.log("I'm listening at %s, on port %s", HOST, PORT);
});
// When an error occurs, show it. 
server.on('error', function (error, socket) {
    console.error(error);
    socket.close();
    // Close the connection after the error occurred. 
    // server.destroy();
}); 