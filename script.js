'use strict';

////////////////////////////////////////////////////
let cols = 10;
let rows = 10;
let minRow = 10;
let maxRow = 40;
let minCol = 10;
let maxCol = 40;
let mineFreq = 0.1;
let mineCnt = 20;
let exceptionX = 0;
let exceptionY = 0;
let grid;
let visibile;
let marked;
let totalMarked;
let opened;

const column = document.getElementById('column');
const row = document.getElementById('row');
const submit = document.getElementById('sumbit');
const message = document.querySelector('.message');
let play = document.querySelector('.play');
const info = document.querySelector('.info');
const stat = document.querySelector('.stat');
const result = document.querySelector('.result');

//////////////////////////////////////////

message.textContent = `Enter dimensions between ${minRow} and ${maxRow}`;

function createBoard() {
  play.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    play.insertAdjacentHTML(
      'beforeend',
      `<div class="board boardRow${i}"></div>`
    );
    const board = document.querySelector(`.boardRow${i}`);
    for (let j = 0; j < cols; j++) {
      board.insertAdjacentHTML(
        'beforeend',
        `<div class="cell" data-i=${i} data-j=${j}></div>`
      );
    }
  }
}

function updateStat() {
  stat.textContent = `Marked : ${totalMarked} / ${mineCnt}`;
}

function setBoard() {
  grid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));
  visibile = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));
  marked = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));
  totalMarked = 0;
  opened = 0;
  mineCnt = Math.floor(cols * rows * mineFreq);
  info.textContent = `Rows : ${rows} | Columns : ${cols} | Mines : ${mineCnt}`;
  updateStat();
}

function getRandomNumber(num) {
  return Math.floor(Math.random() * num);
}

function addMines(mines) {
  while (mines) {
    let i = getRandomNumber(rows);
    let j = getRandomNumber(cols);
    if (i == exceptionX && j == exceptionY) continue;
    if (grid[i][j] === 0) {
      grid[i][j] = -1;
      mines--;
    }
  }
}

function isValid(a, b) {
  return a >= 0 && a < rows && b >= 0 && b < cols;
}

function setNeighbour(i, j) {
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (isValid(i + x, j + y) && grid[i + x][j + y] !== -1)
        grid[i + x][j + y]++;
    }
  }
}

function calcNumbers() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === -1) setNeighbour(i, j);
    }
  }
}

function disableBoard() {
  play.replaceWith(play.cloneNode(true));
  play = document.querySelector('.play');
}

submit.addEventListener('click', function (e) {
  cols = parseInt(column.value);
  rows = parseInt(row.value);
  if (!cols || !rows) {
    message.textContent = `Enter valid Numbers (between ${minRow} and ${maxRow})`;
  } else if (cols < minCol || cols > maxCol || rows < minRow || rows > maxRow)
    message.textContent = `Enter Numbers between ${minRow} and ${maxRow}`;
  else {
    message.textContent = 'Game Start!!!';
    result.textContent = '';
    disableBoard();
    createBoard();
    setBoard();

    init();
  }
});

function getCell(i, j) {
  return document.querySelector(`.boardRow${i} > div[data-j='${j}']`);
}

function gameOver(a, b, cell) {
  cell.classList.add('cell--wrong');

  // Game Over and close game

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === -1)
        setTimeout(() => {
          getCell(i, j).insertAdjacentHTML(
            'afterbegin',
            '<img src="img/mine.svg" class="mine"/>'
          );
        }, 75 * Math.sqrt((a - i) ** 2 + (b - j) ** 2));
    }
  }

  result.textContent = 'You Lose !!! 😵';
  // Disable board
  disableBoard();
}

function gameWon() {
  // Game Won
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = getCell(i, j);

      if (grid[i][j] === -1) {
        cell.classList.add('cell--final');
      }
    }
  }

  result.textContent = 'You Win !!! 👍';
  // Disable board
  disableBoard();
}

function clicked(i, j, cell) {
  if (grid[i][j] === -1) {
    gameOver(i, j, cell);
    return;
  }
  if (visibile[i][j]) return;
  visibile[i][j] = true;
  cell.classList.add('cell--opened');
  opened++;
  if (opened === rows * cols - mineCnt) {
    // console.log('You Win!!!');
    // Game won
    gameWon();
  }
  if (grid[i][j] === 0) {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (isValid(i - x, j - y) && grid[i - x][j - y] !== -1) {
          clicked(i - x, j - y, getCell(i - x, j - y));
        }
      }
    }
  } else cell.textContent = grid[i][j];
  return true;
}

function cellClick(e) {
  if (!e.target.classList.contains('cell')) return;

  let i = Number(e.target.dataset.i);
  let j = Number(e.target.dataset.j);
  if (!visibile[i][j] && !marked[i][j]) {
    clicked(i, j, e.target);
  }
}

function init() {
  play.addEventListener(
    'click',
    function (e) {
      exceptionX = Number(e.target.dataset.i);
      exceptionY = Number(e.target.dataset.j);

      // Add exception
      addMines(mineCnt);
      calcNumbers();
      play.addEventListener('click', cellClick);
      cellClick(e);
      // console.log(grid);
    },
    { once: true }
  );

  play.addEventListener('dblclick', function (e) {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;

    let i = Number(e.target.dataset.i);
    let j = Number(e.target.dataset.j);
    if (!visibile[i][j]) return;

    let markedNeighbour = 0;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (isValid(i - x, j - y)) {
          if (marked[i - x][j - y]) markedNeighbour++;
        }
      }
    }

    if (markedNeighbour !== grid[i][j]) return;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (isValid(i - x, j - y)) {
          if (!marked[i - x][j - y])
            clicked(i - x, j - y, getCell(i - x, j - y));
        }
      }
    }
  });

  play.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;

    let i = e.target.dataset.i;
    let j = e.target.dataset.j;
    if (!visibile[i][j]) {
      if (!marked[i][j]) {
        if (totalMarked == mineCnt) return;
        totalMarked++;
      } else totalMarked--;
      updateStat();
      marked[i][j] = !marked[i][j];
      e.target.classList.toggle('cell--marked');
    }
  });
}
