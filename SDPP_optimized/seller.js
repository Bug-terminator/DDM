const tls = require('tls');
const { ethers } = require("hardhat");
const interface = require('./interface.json');
const { sleep, item, fs, PORT, HOST, rl, options, $$, $, contract_addresses, provider, sign_msg, verify_signiture, verifier_abi, orderbook_abi } = require("./util");

const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const signer = wallet.connect(provider);

const verifier = new ethers.Contract(contract_addresses[1],
    verifier_abi.abi
    , signer)
const orderbook = new ethers.Contract(contract_addresses[2],
    orderbook_abi.abi, signer
)

const server = tls.createServer(options, async function (socket) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`new client connected: ${clientAddress}`);
    console.log('seller balance:', $(await signer.getBalance()));
    var file_size = 0;
    var file_path = '';
    var granularity = 0;
    var peices = 0;
    var order_ID = '';
    var payment = '';
    var price = 0;
    var total = 0;
    var counter = 0;
    var finished = 0;
    var file;
    var buffer_size = 0;
    var buffer;
    var buyer_addr;
    var position = 0;

    var hello = interface.hello;
    hello.payload = signer.address;
    socket.write(JSON.stringify(hello));

    // Print the data that we received 
    socket.on('data', async (data) => {
        console.log(`Received:${data}`)
        data = JSON.parse(data);

        switch (data.message_type) {
            case "hello":
                socket.write(JSON.stringify(interface.menu));
                break;
            case "resume":
                order_ID = data.payload.order_ID;
                buyer_addr = (await orderbook.getOrderbook(order_ID)).buyer;
                // var sig = ethers.utils.splitSignature(data.signature);
                counter = (await orderbook.getOrderbook(order_ID)).finished_pieces;
                data.signature = '';
                // if (!await verify_signiture(verifier, ethers.utils.id(JSON.stringify(data)), sig, buyer_addr)) {
                //     console.log("sig err");
                //     break;
                // } else { console.log("signature verification passed"); }
                var item_ID = (await orderbook.getOrderbook(order_ID)).item_ID;
                file_path = "./data/data" + item_ID + '.txt';
                console.log("---------------", file_path);
                list_of_available_data = interface.menu.payload.list_of_available_data;
                list_of_available_data.forEach(element => {
                    if (element.item_ID == item_ID) {
                        file_size = element.data_size;
                        price = element.price;
                        granularity = element.granularity;
                        total = 1 / granularity;
                        buffer_size = Math.ceil(file_size / total);
                    }
                });

                if(counter == total){
                    console.log("order already finished");
                    break;
                }
                buffer = Buffer.alloc(buffer_size);

                var fd = fs.openSync(file_path);
                fs.readSync(fd, buffer, 0, buffer_size, counter * buffer_size);
                var real_data = interface.data;
                real_data.payload = buffer.toString();
                var signature = await sign_msg(signer, JSON.stringify(real_data));
                // console.log(ethers.utils.splitSignature(signature));
                real_data.signature = signature;
                // console.log(real_data);
                fs.closeSync(fd);
                await sleep(1000);
                socket.write(JSON.stringify(real_data));
                break;
            case "order":
                order_ID = data.payload.order_ID;
                buyer_addr = (await orderbook.getOrderbook(order_ID)).buyer;
                var sig = ethers.utils.splitSignature(data.signature);
                counter = (await orderbook.getOrderbook(order_ID)).finished_pieces;
                data.signature = '';
                if (!await verify_signiture(verifier, ethers.utils.id(JSON.stringify(data)), sig, buyer_addr)) {
                    console.log("sig err");
                    break;
                } else { console.log("signature verification passed"); }
                file_path = "./data/data" + data.payload.item_ID + '.txt';
                list_of_available_data = interface.menu.payload.list_of_available_data;
                list_of_available_data.forEach(element => {
                    if (element.item_ID == data.payload.item_ID) {
                        file_size = element.data_size;
                        price = element.price;
                        granularity = element.granularity;
                        total = 1 / granularity;
                        buffer_size = Math.ceil(file_size / total);
                    }
                });

                if (!await orderbook.sellerVerifyOrderOnCreated(order_ID, signer.address, buyer_addr, ethers.utils.parseEther(price.toString()))) {
                    console.log("order err");
                    break;
                } else { console.log("order verification passed.\nStart transfer data."); }
                buffer = Buffer.alloc(buffer_size);

                var fd = fs.openSync(file_path);
                fs.readSync(fd, buffer, 0, buffer_size, counter * buffer_size);
                var real_data = interface.data;
                real_data.payload = buffer.toString();
                var signature = await sign_msg(signer, JSON.stringify(real_data));
                // console.log(ethers.utils.splitSignature(signature));
                real_data.signature = signature;
                // console.log(real_data);
                fs.closeSync(fd);
                await sleep(1000);
                socket.write(JSON.stringify(real_data));
                break;
            case "ACK":
                var sig = ethers.utils.splitSignature(data.signature);
                counter = (await orderbook.getOrderbook(order_ID)).finished_pieces;
                if (counter == total) {
                    console.log('finished');
                    break;
                }
                data.signature = '';
                if (!await verify_signiture(verifier, ethers.utils.id(JSON.stringify(data)), sig, buyer_addr)) {
                    console.log("sig err");
                    break;
                } else { console.log("signature verification passed"); }
                if (!await orderbook.sellerVerifyOrderOnPayment(order_ID, signer.address, buyer_addr, ethers.utils.parseEther(price.toString()), counter)) {
                    console.log("payment err");
                    break;
                } else { console.log("payment verification passed.\nStart transfer data."); }
                await sleep(1000);
                var fd = fs.openSync(file_path);
                fs.readSync(fd, buffer, 0, buffer_size, counter * buffer_size);
                var real_data = interface.data;
                real_data.payload = buffer.toString();
                // console.log(real_data);
                var signature = await sign_msg(signer, JSON.stringify(real_data));
                real_data.signature = signature;
                // console.log(ethers.utils.splitSignature(signature));
                fs.closeSync(fd);

                // console.log(real_data);
                socket.write(JSON.stringify(real_data));
                break;
            case "exit":
                console.log("finished");
                console.log('seller after balance:', $(await signer.getBalance()))
                // socket.close();
                break;
            default:
                socket.write("error, unsupported message_type");
            // console.log("error, unsupported message_type");
        }
    });
    // Let us know when the transmission is over 
    socket.on('end', function () {
        console.log('EOT (End Of Transmission)');
    });
    socket.on('error', () => console.log('error'));
});
// Start listening on a specific port and address 
server.listen(PORT, HOST, function () {
    console.log(provider)
    console.log("I'm listening at %s, on port %s", HOST, PORT);
});
// When an error occurs, show it. 
server.on('error', function (error, socket) {
    console.error(error);
    socket.close();
    // Close the connection after the error occurred. 
    // server.destroy();
}); 
console.log()