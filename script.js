const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = 800;
const canvasHeight = canvas.height = 600;
// Variável de estado para controlar se o jogo está em andamento
let jogoEmAndamento = true;

// Classe para representar a nave do jogador
class PlayerShip {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 50;
        this.speed = 5;
        this.shots = [];
    }

    moveLeft() {
        if (this.x > 0) {
            this.x -= this.speed;
        }
    }

    moveRight() {
        if (this.x < canvasWidth - this.width) {
            this.x += this.speed;
        }
    }

    // Método para disparar tiros
    fire() {
        const shot = new Shot(this.x + this.width / 2, this.y);
        this.shots.push(shot);
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Desenhar os tiros
        this.shots.forEach(shot => shot.draw());
    }
}

// Classe para representar os tiros
class Shot {
    constructor(x, y) {
        this.width = 4;
        this.height = 10;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = 8;
    }

    move() {
        this.y -= this.speed;
    }

    ded() {
        this.y = 0;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Array para armazenar os quadrados na barra superior
const quadrados = [
    { x: 100, y: 10, width: 40, height: 40, isVisible: true },
    { x: 200, y: 10, width: 40, height: 40, isVisible: true },
    { x: 300, y: 10, width: 40, height: 40, isVisible: true },
    { x: 400, y: 10, width: 40, height: 40, isVisible: true },
    { x: 500, y: 10, width: 40, height: 40, isVisible: true },
    { x: 600, y: 10, width: 40, height: 40, isVisible: true },

    { x: 150, y: 70, width: 40, height: 40, isVisible: true },
    { x: 250, y: 70, width: 40, height: 40, isVisible: true },
    { x: 350, y: 70, width: 40, height: 40, isVisible: true },
    { x: 450, y: 70, width: 40, height: 40, isVisible: true },
    { x: 550, y: 70, width: 40, height: 40, isVisible: true },

    { x: 200, y: 140, width: 40, height: 40, isVisible: true },
    { x: 300, y: 140, width: 40, height: 40, isVisible: true },
    { x: 400, y: 140, width: 40, height: 40, isVisible: true },
    { x: 500, y: 140, width: 40, height: 40, isVisible: true },

    { x: 250, y: 220, width: 40, height: 40, isVisible: true },
    { x: 350, y: 220, width: 40, height: 40, isVisible: true },
    { x: 450, y: 220, width: 40, height: 40, isVisible: true },

    { x: 300, y: 290, width: 40, height: 40, isVisible: true },
    { x: 400, y: 290, width: 40, height: 40, isVisible: true },

    { x: 350, y: 360, width: 40, height: 40, isVisible: true },

];

// Função principal do jogo
function gameLoop() {
    if (!jogoEmAndamento) return;
    requestAnimationFrame(gameLoop);
    update();
    render();
}

// Função de atualização do estado do jogo
function update() {
    // Atualizar a posição dos tiros
    playerShip.shots.forEach(shot => {
        if (!shot.colidiu) { // Verificar se o tiro já colidiu com algum quadrado
            shot.move();
            // Verificar colisão entre tiros e quadrados vermelhos
            for (let i = 0; i < quadrados.length; i++) {
                const quadrado = quadrados[i];
                if (
                    quadrado.isVisible &&
                    shot.x < quadrado.x + quadrado.width &&
                    shot.x + shot.width > quadrado.x &&
                    shot.y < quadrado.y + quadrado.height &&
                    shot.y + shot.height > quadrado.y
                ) {
                    shot.colidiu = true; // Marcar que o tiro colidiu com um quadrado
                    shot.isVisible = false; // Marcar o tiro como invisível
                    quadrado.isVisible = false;
                    break; // Interromper o loop assim que uma colisão for detectada
                }
            }
        }else{
            shot.ded();
        }
    });

    // Remover tiros que saíram da tela
    playerShip.shots = playerShip.shots.filter(shot => shot.y > 0);

    // Verificar se todos os quadrados amarelos foram destruídos
    const allDestroyed = quadrados.every(quadrado => !quadrado.isVisible);
    // Se todos os quadrados amarelos foram destruídos, mostrar a tela de vitória
    if (allDestroyed) {
        alert("You Win");
        jogoEmAndamento = false;
        const resposta = prompt('Você quer jogar novamente? (sim/nao)').toLowerCase();
        if (resposta === 'sim') {
            quadrados.forEach(quadrado => quadrado.isVisible = true);
            jogoEmAndamento = true;
        }
    }
}



// Função de renderização do jogo
function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Desenhar quadrados
    quadrados.forEach(quadrado => {
        if (quadrado.isVisible) {
            ctx.fillStyle = 'red';
            ctx.fillRect(quadrado.x, quadrado.y, quadrado.width, quadrado.height);
        }
    });
    // Desenhar nave
    playerShip.draw();
}


// Instanciar a nave do jogador
const playerShip = new PlayerShip();

// Event listeners para o movimento da nave do jogador e disparo de tiros
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        playerShip.moveLeft();
    } else if (event.key === 'ArrowRight') {
        playerShip.moveRight();
    } else if (event.key === ' ') { // Espaço para atirar
        playerShip.fire();
    }
});

// Iniciar o jogo
gameLoop();
