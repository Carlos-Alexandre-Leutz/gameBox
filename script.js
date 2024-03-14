const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width = 400;
const canvasHeight = canvas.height = 600;
// Variável de estado para controlar se o jogo está em andamento
let jogoEmAndamento = true;
// Variável para armazenar a pontuação
let pontuacao = 0;

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
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // Inicia o caminho no topo central do triângulo
        ctx.lineTo(this.x + this.width, this.y + this.height); // Desenha uma linha até o canto inferior direito
        ctx.lineTo(this.x, this.y + this.height); // Desenha uma linha até o canto inferior esquerdo
        ctx.closePath(); // Fecha o caminho
        ctx.fill(); // Preenche o triângulo com a cor definida

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
    { x: 40, y: 10, width: 20, height: 40, isVisible: true },
    { x: 100, y: 10, width: 20, height: 40, isVisible: true },
    { x: 160, y: 10, width: 20, height: 40, isVisible: true },
    { x: 210, y: 10, width: 20, height: 40, isVisible: true },
    { x: 270, y: 10, width: 20, height: 40, isVisible: true },
    { x: 320, y: 10, width: 20, height: 40, isVisible: true },

    // { x: 15, y: 70, width: 20, height: 40, isVisible: true },
    // { x: 25, y: 70, width: 20, height: 40, isVisible: true },
    // { x: 35, y: 70, width: 20, height: 40, isVisible: true },
    // { x: 45, y: 70, width: 20, height: 40, isVisible: true },
    // { x: 55, y: 70, width: 20, height: 40, isVisible: true },

    // { x: 20, y: 140, width: 20, height: 40, isVisible: true },
    // { x: 30, y: 140, width: 20, height: 40, isVisible: true },
    // { x: 40, y: 140, width: 20, height: 40, isVisible: true },
    // { x: 50, y: 140, width: 20, height: 40, isVisible: true },
    // { x: 25, y: 220, width: 20, height: 40, isVisible: true },

    // { x: 35, y: 220, width: 20, height: 40, isVisible: true },
    // { x: 45, y: 220, width: 20, height: 40, isVisible: true },

    // { x: 30, y: 290, width: 20, height: 40, isVisible: true },
    // { x: 40, y: 290, width: 20, height: 40, isVisible: true },

    // { x: 35, y: 360, width: 20, height: 40, isVisible: true },

];

// Função principal do jogo
function gameLoop() {
    if (!jogoEmAndamento) return;
    requestAnimationFrame(gameLoop);
    updateEnemies();
    update();
    render();
}

let ultimoAcertoTempo = Date.now();
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
                    const agora = Date.now();
                    const diferencaTempo = agora - ultimoAcertoTempo;
                    ultimoAcertoTempo = agora;
                    score(diferencaTempo);
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
            pontuacao = 0;
            shot.ded();
        }
    }
}

// Variável para controlar a direção do movimento dos inimigos
let direcaoInimigos = 1; // 1 para mover para a direita, -1 para mover para a esquerda

// Função para atualizar a posição dos inimigos
function updateEnemies() {
    // Verificar se os inimigos chegaram às bordas da tela
    let chegouNaBorda = false;
    quadrados.forEach(quadrado => {
        if (quadrado.x + quadrado.width >= canvasWidth || quadrado.x <= 0) {
            chegouNaBorda = true;
        }
    });

    // Se algum inimigo chegou à borda, mudar a direção do movimento
    if (chegouNaBorda) {
        direcaoInimigos *= -1; // Inverter a direção
    }

    // Atualizar a posição dos inimigos com base na direção do movimento
    quadrados.forEach(quadrado => {
        quadrado.x += direcaoInimigos * 2; // Mover os inimigos para a direita ou esquerda
    });
}



// Função de renderização do jogo
function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Desenhar quadrados
    quadrados.forEach(quadrado => {
        if (quadrado.isVisible) {
            // Desenhar triângulo azul apontando para baixo
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(quadrado.x, quadrado.y); // Inicia o caminho no canto superior esquerdo
            ctx.lineTo(quadrado.x + quadrado.width, quadrado.y); // Desenha uma linha até o canto superior direito
            ctx.lineTo(quadrado.x + quadrado.width / 2, quadrado.y + quadrado.height); // Desenha uma linha até a base do triângulo (canto inferior central)
            ctx.closePath(); // Fecha o caminho
            ctx.fill(); // Preenche o triângulo com a cor definida
        }
    });
    // Desenhar tiros
    playerShip.shots.forEach(shot => {
        if (shot.isVisible) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
        }
    });
    // Desenhar nave
    playerShip.draw();
}

const divScore = document.getElementById("score");
function score(pontosNovos) {
    const desconto = Math.floor(pontosNovos/95) ;
    if(desconto <= 100) {
        pontuacao += 100 - desconto;
    }
    divScore.innerHTML = 'Score: ' + pontuacao;
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

const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const fireButton = document.getElementById('fireButton');
let moveLeftInterval;
let moveRightInterval;
let fireInterval;

leftButton.addEventListener('touchstart', () => {
    moveLeftInterval = setInterval(() => {
        playerShip.moveLeft();
    }, 30);
});

leftButton.addEventListener('touchend', () => {
    clearInterval(moveLeftInterval);
});

rightButton.addEventListener('touchstart', () => {
    moveRightInterval = setInterval(() => {
        playerShip.moveRight();
    }, 30);
});

rightButton.addEventListener('touchend', () => {
    clearInterval(moveRightInterval);
});

fireButton.addEventListener('touchstart', () => {
    fireInterval = setInterval(() => {
        playerShip.fire();
    }, 50);
});

fireButton.addEventListener('touchend', () => {
    clearInterval(fireInterval);
});


// Iniciar o jogo
gameLoop();
