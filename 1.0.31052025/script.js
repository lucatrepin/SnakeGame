
let html = document.getElementsByTagName("html")[0];
let body = html.getElementsByTagName("body")[0];
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

body.appendChild(canvas);
canvas.style.backgroundColor = "#9c9c9c";

let canvasSize = 500;
let extraCanvasSizeY = 60;
canvas.style.width = `${canvasSize}` + "px";
canvas.style.height = `${canvasSize + extraCanvasSizeY}` + "px";
canvas.width = canvasSize;
canvas.height = canvasSize + extraCanvasSizeY;
ctx.textAlign = "center";

class Game {
    constructor(proportion) {
        this.gameStats = "screenInitial";
        this.applesDeleted = 0;
        this.proportion = proportion;
        this.score = 0;
        this.time = 0;
        
        this.fontTextPainel = "40px Arial";
        this.colorTextPainel = "#3a21db";

        this.frames = 5;
        
        this.applesDeterioration = true;
        this.deteriorationFrames = 20;
        this.timeApplesDeterioration = 5;
        this.applesInDeterioration = [];
        this.applesMultiplier = 2;
        
    }
    
    displayScreen() {
        switch (this.gameStats) {
            case "screenInitial":
                this.drawPainel("Snake Game");

                this.buttonPlay.drawButton();
                this.buttonPlay.startVerifyClick();

                this.buttonSettings.drawButton();
                this.buttonSettings.startVerifyClick();
                break;
            case "playing":
                snake.init((canvasSize / 2) - (game.proportion / 2), extraCanvasSizeY + (canvasSize / 2) - (game.proportion / 2), "up");
                this.startGame();
                break;
            case "gameOver":
                this.score = 0;
                apples = [];
                snake.positions = [];
                clearInterval(this.intervalDrawPainel);
                clearInterval(this.intervalGame);
                this.buttonRestart.drawButton();
                this.buttonRestart.startVerifyClick();
                break;
        }
    }
    eraseScreen() {
        ctx.clearRect(0, 0, canvasSize, canvasSize + extraCanvasSizeY);
        this.buttons.forEach(button => {
            button.onScreen = false;
        });
    }
    eraseScreenGame() {
        ctx.clearRect(0, extraCanvasSizeY + 1, canvasSize, canvasSize + extraCanvasSizeY);
    }

    createButtons(size, positionInitial, distance) {
        this.buttonPlay = new Button("Play", size, [positionInitial[0], positionInitial[1] + (extraCanvasSizeY / 2)], "30px Arial", "black", "green");
        this.buttonRestart = new Button("Restart", size, [positionInitial[0], positionInitial[1] + (extraCanvasSizeY / 2)], "30px Arial", "black", "green");
        this.buttons = [this.buttonPlay, this.buttonRestart];
    }
    buttonClicked(nameButton) {
        this.eraseScreen();
        switch (nameButton) {
            case "Play":
                this.gameStats = "playing";
                break;
            case "Restart":
                this.gameStats = "screenInitial";
                break;
            case "ExitSettings":
                this.gameStats = "screenInitial";
                break;
        }
        setTimeout(() => {
            this.displayScreen();
        }, 10);
    }

    drawPainel(text) {
        let textPainel = text ? text : this.setTextStatistics();
        ctx.font = this.fontTextPainel;
        ctx.fillStyle = this.colorTextPainel;
        let sizeY = ctx.measureText(textPainel).actualBoundingBoxAscent;
        ctx.clearRect(0, 0, canvasSize, extraCanvasSizeY);
        ctx.fillRect(0, extraCanvasSizeY, canvasSize, 1);
        ctx.fillText(textPainel, canvasSize / 2, (extraCanvasSizeY / 2) + (sizeY / 2));
    }
    setTextStatistics() {
        let numZeros = 6 - this.score.toString().length;
        let zeros = "";
        for (let i = 0; i < numZeros; i++) {
            zeros.concat("0");
        }
        let textScore = zeros + this.score;
        let textTime = this.time.toFixed(2).toString();

        let textStatistics = `Time: ${((performance.now() - this.timeStart) / 1000).toFixed(2)} Score: ${textScore}`;
        return textStatistics;
    }

    startGame() {
        this.eraseScreen();
        this.timeStart = performance.now()
        this.intervalDrawPainel = setInterval(() => {
            this.drawPainel();
        }, 10);
        snake.draw();
        snake.startVerifyChangeMove();
        for(let i = 0; i < this.applesMultiplier; i++) {
            this.createApple();
        }
        this.intervalGame = setInterval(() => {
            this.eraseScreenGame();
            apples.forEach(apple => {
                apple.draw();
            });
            snake.readyToSetDirection = true;
            snake.move();
            snake.draw();
            if (this.score >= 230) {
                alert("voce ganhou");
            }
        }, 1000 / this.frames);
    }

    createApple() {
        this.applesDeleted++;
        setTimeout(() => {
            new Apple();
        }, getRandomN(100, 1000));
    }

}

class Button {
    constructor(nameButton, size, position, fontText, backgroundColor, textColor) {
        this.size = size;
        this.position = [position[0], position[1]];
        this.nameButton = nameButton;
        this.onScreen = false;
        this.fontText = fontText;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
    }
    drawButton() {
        this.onScreen = true;
        ctx.font = this.fontText;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.position[0] - (this.size[0] / 2), this.position[1] - (this.size[1] / 2), this.size[0], this.size[1]);
        let sizeY = ctx.measureText(this.nameButton).actualBoundingBoxAscent;
        ctx.fillStyle = this.textColor;
        ctx.fillText(this.nameButton, this.position[0], this.position[1] + (sizeY / 2));
    }
    startVerifyClick() {
        this.eventVerifyClick = addEventListener("click", (event) => {
            if (this.onScreen) { 
                if (
                    event.offsetX >= this.position[0] - (this.size[0] / 2) &&
                    event.offsetX <= this.position[0] + (this.size[0] / 2) &&
                    event.offsetY >= this.position[1] - (this.size[1] / 2) &&
                    event.offsetY <= this.position[1] + (this.size[1] / 2)
                ) {
                    game.buttonClicked(this.nameButton);
                }
            }
        })
    }
}

class Snake {
    init(pX, pY, direction) {
        this.size = game.proportion;
        this.positions = [[getApproximateNumber(pX, this.size), getApproximateNumber(pY, this.size) + extraCanvasSizeY]];
        this.direction = direction;
        this.readyToSetDirection = true;
        snake.createBody(2);
    }

    createBody(size) {
        let RealAddSize = size - 1;
        let newCreatePosition = [this.positions[0][0], this.positions[0][1]];
        for (let i = 0; i < RealAddSize; i++) {
            switch (this.direction) {
                case "right":
                    newCreatePosition[0] += this.size;
                    break;
                case "left":
                    newCreatePosition[0] -= this.size;
                    break;
                case "down":
                    newCreatePosition[1] += this.size;
                    break;
                case "up":
                    newCreatePosition[1] -= this.size;
                    break;
                    
            }
            this.positions.unshift(newCreatePosition);
            newCreatePosition = [this.positions[0][0], this.positions[0][1]];
        }
    }
    draw() {
        ctx.fillStyle = "green";
        this.positions.forEach(position => {
            ctx.fillRect(position[0], position[1], this.size, this.size);
        });
    }
    move() {
        let newPositionX = this.positions[0][0];
        let newPositionY = this.positions[0][1];
        switch (this.direction) {
            case "right":
                newPositionX += this.size;
                break;
            case "left":
                newPositionX -= this.size;
                break;
            case "down":
                newPositionY += this.size;
                break;
            case "up":
                newPositionY -= this.size;
                break;
        }
        this.positions.unshift([newPositionX, newPositionY]);
        if (this.verifyColliWall()) {
            game.gameStats = "gameOver";
            game.eraseScreen();
            game.displayScreen();
        }
        if (!this.verifyColliApple()) {
            this.positions.pop();
        } else {
            game.score += 10;
        }
        for (let position of this.positions) {
            if (position == this.positions[0]) continue;
            if (this.positions[0][0] == position[0] && this.positions[0][1] == position[1]) {
                game.gameOver();
            }
        }
        

        this.length = this.positions.length;
    }

    startVerifyChangeMove() {
        addEventListener("keydown", (event) => {
            if (this.readyToSetDirection) {
                switch (event.key) {
                    case "ArrowRight":
                    case "d":
                        if (this.direction != "left") {
                            this.direction = "right";
                            this.readyToSetDirection = false;
                        }
                        return "detected";
                    case "ArrowLeft":
                    case "a":
                        if (this.direction != "right") {
                            this.direction = "left";
                            this.readyToSetDirection = false;
                        }
                        return "detected";
                    case "ArrowDown":
                    case "s":
                        if (this.direction != "up") {
                            this.direction = "down";
                            this.readyToSetDirection = false;
                        }
                        return "detected";
                    case "ArrowUp":
                    case "w":
                        if (this.direction != "down") {
                            this.direction = "up";
                            this.readyToSetDirection = false;
                        }
                        break;
                }
            }
        })
    }
    verifyColliWall() {
        if (
            this.positions[0][0] < 0 ||
            this.positions[0][0] > canvasSize - this.size ||
            this.positions[0][1] < extraCanvasSizeY ||
            this.positions[0][1] > canvasSize + extraCanvasSizeY - this.size
        ) {
            return true;
        } else {
            return false;
        }
    }
    verifyColliApple() {
        for (const apple of apples) {
            if (apple.position[0] == snake.positions[0][0] && apple.position[1] == snake.positions[0][1]) {
                apple.removeApple();
                game.createApple();
                return true;
            }
        }
        return false;
    }
}

class Apple {
    constructor() {
        let pX = getApproximateNumber(getRandomN(0, canvasSize), game.proportion) ;
        let pY = getApproximateNumber(getRandomN(0, canvasSize), game.proportion) + extraCanvasSizeY;
        let pCorrects = true;
        do {
            for (const pS of snake.positions) {
                if (pX == pS[0] && pY == pS[1]) {
                    pCorrects = false;
                    break;
                }
                if (snake.positions.indexOf(pS) == snake.positions.length - 1) {
                    pCorrects = true;
                }
            }
            if (!pCorrects) {
                pX = getApproximateNumber(getRandomN(0, canvasSize), game.proportion);
                pY = getApproximateNumber(getRandomN(extraCanvasSizeY, extraCanvasSizeY + canvasSize), game.proportion);
            }
        } while (!pCorrects)
        
        this.position = [pX, pY];
        apples.push(this);
        
        this.color = "#ff0000";

        if (game.applesDeterioration) {
            let frames = game.deteriorationFrames;
            let valueFrames = parseInt((256 / frames).toFixed());
            let interval = (game.timeApplesDeterioration / frames) * 1000;
            let cont = 1;
            let intervalDeterioration = setInterval(() => {
                cont++;
                if (cont == frames) {
                    clearInterval(intervalDeterioration);
                    game.applesInDeterioration.push(this);
                    this.color = "#000000";
                    setTimeout(() => {
                        if (apples.includes(this)) {
                            game.applesInDeterioration.splice(game.applesInDeterioration.indexOf(this), 1);
                            this.removeApple();
                            game.createApple();
                        }
                    }, interval);
                } else {
                    let r = this.color[1] + this.color[2];
                    let n = parseInt(r, 16) - valueFrames;
                    r = n.toString(16);
                    this.color = `#${r}0000`;
                }
            }, interval);
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position[0], this.position[1], game.proportion, game.proportion);
    }

    removeApple() {
        apples.splice(apples.indexOf(this), 1);
    }
}

let game = new Game(25);
let snake = new Snake();
let apples = [];

game.createButtons([200, 40], [canvasSize / 2, canvasSize / 2], 10); // proporcionar com %
game.displayScreen();


/**
 * Arredonda um número para o múltiplo mais próximo de um determinado intervalo.
 *
 * @param {number} n O número a ser arredondado.
 * @param {number} intervalo O valor do múltiplo para o qual 'n' será aproximado. Deve ser diferente de zero.
 * @returns {number} O número 'n' arredondado para o múltiplo mais próximo do 'intervalo'.
 */
function getApproximateNumber(n, intervalo) {
    return Math.round(n / intervalo) * intervalo;
}

function getRandomN(min, max) {
    return (Math.random() * (max - min) + min);
}









