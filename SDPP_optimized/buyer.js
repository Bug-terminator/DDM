const tls = require('tls');
const { ethers } = require("hardhat");
const interface = require('./interface.json');
const { sleep, fs, PORT, HOST, rl, options, $$, $, contract_addresses, provider, sign_msg, verify_signiture, verifier_abi, orderbook_abi } = require("./util");



const wallet = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const signer = wallet.connect(provider);


const verifier = new ethers.Contract(contract_addresses[1],
    verifier_abi.abi
    , signer)
const orderbook = new ethers.Contract(contract_addresses[2],
    orderbook_abi.abi, signer
)
var buffer_size = 0;
var buffer;
var file;
var seller_addr;
var order_ID;
var counter = 0;
var total = 0;
const client = tls.connect(PORT, HOST, options,async function () {
    console.log('buyer balance:', $(await signer.getBalance()));
    // Check if the authorization worked 
    // if (client.authorized) {
    //     console.log("Connection authorized by a Certificate Authority.");
    // } else {
    //     console.log(`Connection not authorized: ${client.authorizationError}`);
    // }
    // Send a friendly message 
    // client.write(`client connected to ${HOST}:${PORT}`);
    // client.end();
});
client.on("data", async (data) => {
    console.log(`Received: ${data}`);
    data = JSON.parse(data);

    switch (data.message_type) {
        case "menu":
            var order = interface.order;
            rl.question('Input item_ID: \n', async (item_ID) => {
                item_ID = Number(item_ID);
                order.payload.item_ID = item_ID;

                var item = {
                    item_ID: 0,
                    data_size: 0,
                    data_info: "",
                    price: 0,
                    granularity: 0
                }
                data.payload.list_of_available_data.forEach(element => {
                    if (element.item_ID == item_ID) {
                        item = element;
                    }
                });
                await sleep(1000);
                const info = {
                    buyer: signer.address,
                    seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                    item_ID: Number(order.payload.item_ID),
                    total_pieces: 1 / item.granularity,
                    finished_pieces: 0,
                    start_time: 0,
                    deadline: 0,
                    cost: item.price,
                    is_finished: false
                }
                total = info.total_pieces;
                seller_addr = info.seller;
                buffer_size = Math.ceil(item.data_size / info.total_pieces);
                buffer = Buffer.alloc(buffer_size);
                order_ID = await orderbook.callStatic.create(info, { value: $$(item.price.toString()) });
                const hash = (await orderbook.create(info, { value: $$(item.price.toString()) })).hash;
                order.payload.order_ID = order_ID;
                order.verification = hash;
                const sig = await sign_msg(signer, JSON.stringify(order));
                order.signature = sig;
                // console.log(order);
                client.write(JSON.stringify(order));
            });
            break;
        case "data":
            console.log("data length: ", data.payload.length);
            var sig = ethers.utils.splitSignature(data.signature);
            // console.log(sig);
            data.signature = '';
            // console.log(seller_addr);
            if (!await verify_signiture(verifier, ethers.utils.id(JSON.stringify(data)), sig, seller_addr)) {
                console.log("sig err");
                break;
            } else { console.log("signature verification passed"); }

            const answer = await new Promise(resolve => {
                rl.question("please verify the data, then press y/n \n", resolve)
            })
            await sleep(1000);
            // console.log(answer);
            if (answer == 'y') {
                
                // fs.appendFile("down data.payload);
                var fd = fs.openSync("download.txt", flags = "a+");
                fs.writeSync(fd, data.payload);
                var ack = interface.ACK;
                const hash = (await orderbook.increase(order_ID)).hash;
                counter++;
                if (counter == total) {
                    console.log('finished');
                    await orderbook.settlement(order_ID/* ,{gasLimit: 500000000} */);
                    console.log('buyer after balance:', $(await signer.getBalance()));
                    client.write(JSON.stringify(interface.exit));
                    break;
                    // client.end();
                }
                ack.verification = hash;
                const sig = await sign_msg(signer, JSON.stringify(ack));
                ack.signature = sig;
                fs.closeSync(fd);
                client.write(JSON.stringify(ack));

            } else {
                console.log("data err")
                // await orderbook.settlement(order_ID);
                // client.end();
            }
            break;
        case "exit":
            break;
        default:
            client.write("error, unsupported message_type");
        // console.log("error, unsupported message_type");
    }
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