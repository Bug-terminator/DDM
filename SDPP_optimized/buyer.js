const tls = require('tls');
const fs = require('fs');
const PORT = 1234;
const HOST = 'localhost'
// Pass the certs to the server and let it know to process even unauthorized certs. 
const options = {
    key: fs.readFileSync('private-key'),
    cert: fs.readFileSync('public-cert'),
    rejectUnauthorized: false
};
const client = tls.connect(PORT, HOST, options, function () {
    // Check if the authorization worked 
    if (client.authorized) {
        console.log("Connection authorized by a Certificate Authority.");
    } else {
        console.log(`Connection not authorized: ${client.authorizationError}`);
    }
    // Send a friendly message 
    client.write(`client connected to ${HOST}:${PORT}`);
    // client.end();
});
client.on("data", (data) => {
    console.log(`Received: ${data}`);
});
client.on('close', () => {
    console.log("Connection closed");
});
// When an error ocoures, show it. 
client.on('error', (error) => {
    console.error(error);
    // Close the connection after the error occurred. 
    // client.destroy();
}); 