// Oliver Kovacs 2020 - snake-js

module.exports = class Snake {
    constructor(x = 8, y = x, score = 3, direction = 0, startX = 0, startY = 0, food = 5) {
        this.dimensions = { x, y };
        this.score = score;
        this.direction = direction;
        this.head = [ startX, startY ];
        this.field = Array(x).fill(0).map(() => Array(y).fill(0));
        this.field[startX][startY] = this.score;
        while (food-- > 0) {
            this.generateFood();
        }

        [ "right", "up", "left", "down" ].forEach((direction, i) => {
            Snake.prototype[direction] = () => {
                if (Math.abs(this.direction - i) === 2) return;
                this.direction = i;
            }
        });
    }

    next() {
        let error = "";
        let vector = this.directionToVector();
        let next = this.head.map((e, i) => e + vector[i]);

        if (this.collision(...next)) error = "collision";
        else {
            let [ x, y ] = next;
            this.head = [ ...next ];
            switch (this.field[x][y]) {
                case -1:
                    this.score++;
                    this.changeLength(1);
                    this.generateFood();
                default:
                    this.changeLength(-1);
            }
            this.field[x][y] = this.score;
        }

        return {
            score: this.score,
            field: this.field,
            error,
        };
    }

    directionToVector() {
        return [
            ((this.direction + 1) % 2) * (-2 * Math.floor(this.direction / 2) + 1),
            (this.direction % 2) * (2 * Math.floor(this.direction / 2) - 1),
        ];
    }

    changeLength(n) {
        this.field = this.field.map(column => column.map(tile => tile > 0 ? tile + n : tile));
    }

    collision(x, y) {
        return x < 0 || y < 0 || x > this.dimensions.x - 1 || y > this.dimensions.y - 1 || this.field[x][y] > 0;
    }

    stringify() {
        return this.field[0].map((_, i) => this.field.map(column => column[i] === -1 ? "x" : column[i]).join("")).join("\r\n");
    }

    random(max) {
        return Math.floor(Math.random() * max);
    }

    generateFood() {
        const { x, y } = this.dimensions;
        let i, j;

        while (true) {
            if (!this.field[i = this.random(x)][j = this.random(y)]) {
                this.field[i][j] = -1;
                break;
            }
        }
    }

    right() {
        this.direction = 0;
    }

    up() {
        this.direction = 1;
    }

    left() {
        this.direction = 2;
    }

    down() {
        this.direction = 3;
    }
}
