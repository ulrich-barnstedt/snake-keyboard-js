const config = require("./config.json");
const lookupTable = require(config.keyboard.layout);
const { rlext } = require("0x81-utils")
const Snake = require("./snake2.js");

class snakeController {
    constructor (client, leds, id) {
        this.client = client;
        this.leds = leds;
        this.id = id;
        this.keyArr = leds.map(l => l.name);

        this.lastArray = [];
        this.lastArray.length = config.keyboard.keys;
        this.lastArray.fill({});

        this.snake = new Snake(config.game.size.rows, config.game.size.cols);
    }

    async init () {
        await this.initialColors();
        await this.startPlaying();
    }

    prefix (name) {
        return `Key: ${name}`;
    }

    keyToColor (key, color) {
        let name = this.prefix(key);
        let index = this.keyArr.indexOf(name);

        if (index === -1) {
            throw "Unknown key: " + name;
        }

        this.lastArray[index] = color;
    }

    keysToColor (keys, color) {
        keys.forEach((key) => {
            this.keyToColor(key, color);
        })
    }

    clearPlayArea () {
        lookupTable.forEach(row => {
            this.keysToColor(row, config.colors.playArea);
        })
    }

    async initialColors () {
        //bg
        this.lastArray.forEach((v, idx) => this.lastArray[idx] = config.colors.bg);

        //playing area
        this.clearPlayArea();

        //arrow
        this.keysToColor(['Right Arrow', 'Left Arrow', 'Down Arrow', 'Up Arrow'], config.colors.arrowKeys);

        //display
        await this.setLast();
    }

    async setLast () {
        await this.client.updateLeds(this.id, this.lastArray);
    }

    //---- game

    async drawOutput (array, max, error) {
        this.clearPlayArea();

        array.forEach((row, r) => {
            row.forEach((cell, c) => {
                let char = lookupTable[r][c];

                switch (cell) {
                    case 0:
                        break;
                    case -1:
                        if (error) {
                            this.keyToColor(char, config.colors.deadFood);
                            break;
                        }

                        this.keyToColor(char, config.colors.food);
                        break;
                    default:
                        if (cell === max && !error) {
                            this.keyToColor(char, config.colors.head);
                            break;
                        }

                        if (error) {
                            this.keyToColor(char, config.colors.death);
                            break;
                        }

                        this.keyToColor(char, config.colors.body);
                }
            })
        })

        await this.setLast();
    }

    async startPlaying () {
        //main loop
        let renderLoop = setInterval(() => {
            let frame = this.snake.next();

            if (frame.error !== "") {
                clearInterval(renderLoop);
                this.drawOutput(frame.field, frame.score, true);
                return;
            }

            this.drawOutput(frame.field, frame.score);
        }, config.game.interval);

        //input
        let emitter = rlext.rEmitter();

        emitter.on("raw", (key) => {
            switch (key.name) {
                case "left":
                    this.snake.up();
                    break;
                case "right":
                    this.snake.down();
                    break;
                case "up":
                    this.snake.left();
                    break;
                case "down":
                    this.snake.right();
                    break;
                default:
                    return;
            }
        })
    }
}

module.exports = snakeController;
