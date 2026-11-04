// Elementos do DOM
const gameContainer = document.getElementById('gameContainer');
const notesContainer = document.getElementById('notesContainer');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Configurações e Estado do Jogo
let score = 0;
let combo = 0;
let gameInterval;
let spawnInterval;
let isPlaying = false;
let activeNotes = [];

const keys = ['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];
const noteSpeed = 4; // Velocidade com que as notas sobem (px por frame)
const targetY = 40;  // Posição Y do alvo no topo (igual ao CSS)

// 1. Lógica do Botão de Tela Cheia
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            alert(`Erro ao tentar ativar tela cheia: ${err.message}`);
        });
        fullscreenBtn.textContent = "🗗 Sair da Tela Cheia";
    } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = "⛶ Tela Cheia";
    }
});

// Listener para atualizar o texto caso o usuário saia usando a tecla ESC
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.textContent = "⛶ Tela Cheia";
    }
});

// 2. Iniciar o Jogo
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    resetGame();
    isPlaying = true;
    
    // Loop principal (movimentação das notas)
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    
    // Gerador de notas (cria uma nota a cada 800 milissegundos)
    spawnInterval = setInterval(spawnNote, 800);
});

function resetGame() {
    score = 0;
    combo = 0;
    activeNotes = [];
    notesContainer.innerHTML = '';
    scoreEl.textContent = score;
    comboEl.textContent = combo;
}

// 3. Criar uma nova Nota
function spawnNote() {
    if (!isPlaying) return;
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const noteEl = document.createElement('div');
    noteEl.classList.add('note');
    noteEl.setAttribute('data-type', randomKey);
    
    // Símbolo visual dentro da nota
    if(randomKey === 'ArrowLeft') noteEl.textContent = '←';
    if(randomKey === 'ArrowUp') noteEl.textContent = '↑';
    if(randomKey === 'ArrowDown') noteEl.textContent = '↓';
    if(randomKey === 'ArrowRight') noteEl.textContent = '→';

    notesContainer.appendChild(noteEl);
    
    // Guarda os dados da nota para controle de posição
    activeNotes.push({
        element: noteEl,
        type: randomKey,
        y: 0 // Começa na base (bottom: 0)
    });
}

// 4. Mover Notas e Detectar Perda de Notas (Miss)
function updateGame() {
    for (let i = activeNotes.length - 1; i >= 0; i--) {
        const note = activeNotes[i];
        note.y += noteSpeed;
        note.element.style.bottom = note.y + 'px';
        
        // Posição atual do topo da nota em relação à área do jogo
        const containerHeight = notesContainer.offsetHeight;
        const currentTop = containerHeight - note.y - 60; // 60 é a altura da nota

        // Se passar direto pelos alvos e sair da tela superior (Errou)
        if (currentTop < -20) {
            note.element.remove();
            activeNotes.splice(i, 1);
            combo = 0; // Reseta o combo
            comboEl.textContent = combo;
        }
    }
}

// 5. Capturar Entrada do Teclado
window.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    
    if (keys.includes(e.key)) {
        e.preventDefault(); // Impede a página de rolar com as setas
        
        // Efeito visual no Alvo correspondente
        const target = document.querySelector(`.target-lane[data-key="${e.key}"]`);
        if (target) {
            target.classList.add('active');
            setTimeout(() => target.classList.remove('active'), 100);
        }
        
        // Verificar se acertou alguma nota ativa na pista correspondente
        checkHit(e.key);
    }
});

// 6. Sistema de Detecção de Acerto (Hitbox)
function checkHit(pressedKey) {
    let hitDetected = false;
    const containerHeight = notesContainer.offsetHeight;

    for (let i = 0; i < activeNotes.length; i++) {
        const note = activeNotes[i];
        
        // Só verifica notas da mesma seta pressionada
        if (note.type === pressedKey) {
            const currentTop = containerHeight - note.y - 60;
            
            // Distância entre o topo da nota e o centro do Alvo (targetY = 40)
            const distance = Math.abs(currentTop - targetY);
            
            // Margem de acerto aceitável de pixels
            if (distance < 45) {
                // Remove a nota acertada da tela e do array
                note.element.remove();
                activeNotes.splice(i, 1);
                
                // Atualiza pontuação e combo
                combo++;
                score += 10 + (combo * 2); // Mais combo dá mais pontos!
                
                scoreEl.textContent = score;
                comboEl.textContent = combo;
                
                hitDetected = true;
                break;
            }
        }
    }
    
    // Se apertou e não tinha nenhuma nota perto naquela pista
    if (!hitDetected) {
        combo = 0;
        comboEl.textContent = combo;
    }
}

