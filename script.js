
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
    
    constructor() {
        this.gameStats = "screenInitial";
        this.dificult = 1;
        this.score = 10;
        this.time = 0;

        this.fontTextPainel = "40px Arial";
        this.colorTextPainel = "#3a21db";
    }

    setDrawPainel(text) {
        let textPainel = text ? text : this.calcTextStatistics();
        ctx.font = this.fontTextPainel;
        ctx.fillStyle = this.colorTextPainel;

        let sizeY = ctx.measureText(textPainel).actualBoundingBoxAscent;
        ctx.clearRect(0, 0, canvasSize, extraCanvasSizeY);
        ctx.fillRect(0, extraCanvasSizeY, canvasSize, 1);
        ctx.fillText(textPainel, canvasSize / 2, (extraCanvasSizeY / 2) + (sizeY / 2));
    }
    calcTextStatistics() {
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

    displayScreen() {
        this.eraseScreen();
        switch (this.gameStats) { //fazer game over
            case "screenInitial":
                console.log("na tela inicial");
                this.setDrawPainel("Snake Game");
                
                this.buttonPlay.drawButton();
                this.buttonPlay.startVerifyClick();

                this.buttonSettings.drawButton();
                this.buttonSettings.startVerifyClick();
                break;
            case "playing":
                console.log("está rodando o game");
                this.startGame();
                break;
            case "inSettings":
                console.log("abrio config");
                this.setDrawPainel("Settings");
                this.buttonExitSettings.drawButton();
                this.buttonExitSettings.startVerifyClick();
                break;
            case "gameOver":// a fazer
                alert("voce murreu");
                break;
        }
        ctx.fillStyle = "black";
    }
    eraseScreen() {
        ctx.clearRect(0, 0, canvasSize, canvasSize + extraCanvasSizeY);
        this.buttons.forEach(button => {
            button.onScreen = false;
        });
        console.log("tela limpa");
    }

    createButtons(size, positionInitial, distance) {
        this.buttonPlay = new Button("Play", size, [positionInitial[0], positionInitial[1] + (extraCanvasSizeY / 2)], "30px Arial", "black", "green");
        this.buttonSettings = new Button("Settings", size, [positionInitial[0], positionInitial[1] + (extraCanvasSizeY / 2) + (1*size[1]) + (1*distance)], "30px Arial", "black", "green");
        this.buttonRestart = new Button("Restart", size, [positionInitial[0], positionInitial[1] + (extraCanvasSizeY / 2)], "black", "green");
        this.buttonExitSettings = new Button("ExitSettings", size, [positionInitial[0], 1.95*positionInitial[1] + (extraCanvasSizeY / 2)], "30px Arial", "black", "red");
        this.buttons = [this.buttonPlay, this.buttonSettings, this.buttonRestart, this.buttonExitSettings];
    }
    buttonClicked(nameButton) {
        console.log("clicou em", nameButton);
        switch (nameButton) {
            case "Play":
                this.gameStats = "playing";
                break;
            case "Settings":
                this.gameStats = "inSettings";
                break;
            case "Restart":
                this.gameStats = "screenInitial";
                break;
            case "ExitSettings":
                this.gameStats = "screenInitial";
                break;
        }
        this.displayScreen();
    }

    startTimer() {
        this.timeStart = performance.now();
        setInterval(() => {
            this.setDrawPainel();
        }, 1);
    }

    startGame() {
        this.startTimer();
        setInterval(() => {
            this.eraseScreen();
            snake.move();
            snake.draw();
        }, 1000 / this.dificult);
        snake.startVerifyChangeMove();
    }
    gameOver() {
        this.eraseScreen();
        this.gameStats = "gameOver";
        this.displayScreen();
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
        this.gbg = addEventListener("click", (event) => {
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
    constructor() {
        this.size = 100;
        this.positions = [[(canvasSize / 2) - (this.size / 2), extraCanvasSizeY]];
        this.direction = "right";
    }

    draw() {
        ctx.fillStyle = "green";
        this.positions.forEach(position => {
            console.log(position);
            ctx.fillRect(position[0], position[1], this.size, this.size);
        });
    }
    move() {
        let newPosition = [this.positions.at(-1)[0], this.positions.at(-1)[1]];
        switch (this.direction) {
            case "right":
                newPosition[0] += this.size;
                break;
            case "left":
                newPosition[0] -= this.size;
                break;
            case "down":
                newPosition[1] += this.size;
                break;
            case "up":
                newPosition[1] -= this.size;
                break;
        }
        
        this.positions.unshift(newPosition);
        if (this.verifyColliWall()) {
            game.gameOver();
        }
        if (!this.verifyColliApple()) {
            this.positions.pop();
        }
    }

    startVerifyChangeMove() {
        addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowRight":
                case "d":
                    if (this.direction != "left") {
                        this.direction = "right";
                    }
                    break;
                case "ArrowLeft":
                case "a":
                    if (this.direction != "right") {
                        this.direction = "left";
                    }
                    break;
                case "ArrowDown":
                case "s":
                    if (this.direction != "up") {
                        this.direction = "down";
                    }
                    break;
                case "ArrowUp":
                case "w":
                    if (this.direction != "down") {
                        this.direction = "up";
                    }
                    break;
            }
        });
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
        
    }
    

}



let game = new Game();
let snake = new Snake();

// size, positionInitial, distance
game.createButtons([200, 40], [canvasSize / 2, canvasSize / 2], 10); // proporcionar com %
game.displayScreen();





