const {OpenRGBClient} = require("openrgb");
const snakeController = require("./snekControl");
const config = require("./config.json");

(async () => {
    const client = new OpenRGBClient({
        host : config.openRGB.server,
        port : config.openRGB.port,
        name : "Node.js Snek"
    })

    await client.connect();
    let count = await client.getControllerCount();

    let keyboard;
    let id;
    for (let i = 0; i<count; i++) {
        let dev = await client.getDeviceController(i);
        if (dev.serial === config.keyboard.serial) {
            keyboard = dev;
            id = i;
        }
    }

    let controller = new snakeController(client, keyboard.leds, id);
    await controller.init();
})()

