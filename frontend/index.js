//Estas lineas de codigo definen variables constantes y les asigna un valor, este valor es una representacion hexadecimal de un color.
const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

//esta linea de codigo establece una coneccion a un servidor Socket.IO ejecutandose en la URL especificada.
const socket = io('mp-blue.vercel.app');

//estas lineas de codigo esperan por varios mensajes que el servidor Socket.io podria enviar al cliente. el metodo socket.on() requiere dos variables: el nombre del evento por el que espera y una funcion callback que sera invocada cuando el evento es recibido. 
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

//estas lineas de codigo guardan referencias a elementos html en el documento usando el metodo getElementById(). cada elemento es guardado en constantes para un acceso a ellos mas sencillo a lo largo del codigo
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

//estas lineas de codigo esperan por eventos click en los elementos newGameBtn and joinGameBtn. cuando son estos elementos son clickeados, la funcion callback correspondiente, newGame or joinGame, sera ejecutada.
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

//esta funcion es responsable por iniciar el proceso de crear un nuevo juego y emite un evento de newGame al servidor
function newGame() {
  socket.emit('newGame');
  init();
}

//esta funcion maneja el proceso de unirse a una partida existente usando un codigo de partida, toma el codigo de partida del input field y emite un evento joinGame al servidor con el codigo
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

//estas lineas declaran tres variables globales
let canvas, ctx;
let playerNumber;
let gameActive = false;

//esta funcion es responsable por iniciar el juego y preparar el entorno para gameplay. esconde la pantalla inicial y muestra el juego. toma el elemento canvas y su contexto. da el tamaño al canvas. limpia el canvas y le da color. espera eventos de teclado. marca el juego como activo.
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

//esta funcion es responsable por manejar los eventos de input de teclado. emite un evento keydown al servidor con el codigo de tecla
function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

//esta funcion es responsable por renderizar el estado de juego en el canvas.recibe el estado de juego y actualiza la representacion visual de los elementos del juego en consecuencia. limpia el canvas y le da color. dibuja la comida y los jugadores
function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}

//esta funcion es responsable por dibujar la serpiente de un jugador en el canvas. recibe el estado de jugador, el tamaño de grid cell, y el color del jugador.
function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

//esta funcion es responsable por procesar el evento init recibido del servidor socket.IO. cuando esta funcion es llamada, guarda el numero de jugador recibido en una variable
function handleInit(number) {
  playerNumber = number;
}

//esta funcion es responsable por procesar el evento gameState recibido del servidor Socket.IO. cuando esta funcion es llamada, checkea si el juego este activo y actualiza el estado de juego en consecuencia
function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

//esta funcion es responsable por procesar el evento gameOver recibido del servidor Socket.IO. cuando es llamada, actualiza el estado de juego y muestra un mensaje con el resultado del juego.
function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

//esta funcion es responsable por mostrar el codigo de partida recibido del servidor Socket.IO. el codigo es un identificador unico para cada partida en especifico, y esta funcion actualiza el elemento HTML con el ID gameCodeDisplay para reflejar el codigo de partida recibido.
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

//esta funcion es responsable por manejar escenarios donde el servidor responde con un mensaje de codigo de partida desconocido. cuando esta funcion es llamada, resetea el juego a su estado inicial y muestra un mensaje informando al jugador de lo sucedido.
function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

//esta funcion es responsable por manejar escenarios donde el servidor responde con un mensaje de demasiados jugadores. cuando es llamada, resetea el juego a su estado inicial y muestra un mensaje informando al jugador de lo sucedido.
function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

//esta funcion es responsable por resetear el juego a su estado inicial cuando se lo requiera.
function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
