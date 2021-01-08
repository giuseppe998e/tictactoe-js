/**
 * Copyright (C) 2020 Giuseppe Eletto
 * 
 * "TicTacToe.js" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * "TicTacToe.js" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with "TicTacToe.js". If not, see <http://www.gnu.org/licenses/>.
 */

"use strict"

const TicTacToe = function(boardId) {
  // ---------------------------------------------
  // Private Constants
  // ---------------------------------------------
  const INSTANCE = {}

  const WIN_CONDITIONS = [[0, 1, 2], [0, 3, 6], [0, 4, 8], [1, 4, 7], [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]]

  const PLAYER = {
    Human: -1,
    Blank: 0,
    Computer: 1
  }

  const UI_BOARD = (() => { // Called one time only
    if (!(typeof boardId === 'string' && boardId[0] === '#')) {
      throw 'Board not found!'
    }

    return document.querySelectorAll(`${boardId} .ttt-box`)
  })()

  // ---------------------------------------------
  // Private Variables
  // ---------------------------------------------
  let boardState = Array(9).fill(PLAYER.Blank)

  let humanWins = 0
  let computerWins = 0

  let difficulty = 2 // 0 = Easy, 1 = Normal, 2 = Impossible
  let playerTurn = PLAYER.Human

  let winHandler = null
  let drawHandler = null
  let pointsHandler = null

  // ---------------------------------------------
  // Private Methods
  // ---------------------------------------------
  const matchHandler = () => {
    const isVictory = isWinMove()
    const isDraw = isDrawMove()

    if (isVictory || isDraw) {
      if (isVictory) {
        if (isHumanTurn()) {
          console.log('Player "Human" WINS!')
          playerTurn = PLAYER.Human
          humanWins += 1
        } else {
          console.log('Player "Computer" WINS!')
          playerTurn = PLAYER.Computer
          computerWins += 1
        }
    
        if ('function' == typeof winHandler) {
          winHandler(playerTurn == PLAYER.Human ? 'Human' : 'Computer')
        }
    
        if ('function' == typeof pointsHandler) {
          pointsHandler(humanWins, computerWins)
        }
      }

      else if (isDraw) {
        console.log('DRAW!')

        if ('function' == typeof drawHandler) {
          drawHandler()
        }
      }
      
      setTimeout(() => INSTANCE.init(), 350)
      return true
    }

    return false
  }

  const computerTurn = () => {
    if (!isHumanTurn()) {
      let move = -1
      
      switch (difficulty) {
        case 0:
          move = easyMode()
          break
        case 1:
          move = fairMode()
          break
        case 2:
          move = impossibleMode()
          break
      }
  
      if (markBox(move) && !matchHandler()) {
          playerTurn = PLAYER.Human
      }
    }
  }

  const easyMode = () => {
    throw 'To be implemented!' // TODO EasyMode
  }

  const fairMode = () => {
    throw 'To be implemented!' // TODO FairMode
  }

  const impossibleMode = () => {
    let bestScore = -2,
        bestMove  = -1
    
    for (let x = 0; x < boardState.length; x++) {
      if (isBlankBox(x)) {
        const possibleBoard = getPossibleBoard(PLAYER.Computer, x)
        const possibleScore = calcAlphaBetaPrunning(possibleBoard, PLAYER.Human, -2, +2)

        console.log(`SCORE: ${bestScore} | POSSIBLE: ${possibleScore}`)

        if (bestScore < possibleScore) {
          bestScore = possibleScore
          bestMove = x
        }
      }
    }

    return bestMove
  }

  const calcAlphaBetaPrunning = (board, player, alpha /*Computer*/, beta /*Human*/) => {
    const winner = getWinner(board)
    if (winner !== false) {
      console.log(winner * player)
      return winner * player // Heuristic Node Value
    }

    let bestScore = null

    // Maximizing Alpha
    if (player == PLAYER.Computer) { // isMaximizingPlayer = True
      bestScore = -2

      while (nextBlankBox(x, board) !== -1)



      for (let x = 0; x < board.length; x++) { 
        if (isBlankBox(x, board)) {
          const possibleBoard = getPossibleBoard(player, x, board)
          const possibleScore = calcAlphaBetaPrunning(possibleBoard, PLAYER.Human, alpha, beta)

          bestScore = Math.max(bestScore, possibleScore)
          alpha = Math.max(alpha, bestScore)

          if (beta <= alpha) {
            break
          }
        }
      }
    }
    // Minimizing Beta
    else if (player == PLAYER.Human) { // isMaximizingPlayer = False
      bestScore = +2

      for (let x = 0; x < board.length; x++) {
        if (isBlankBox(x, board)) {
          const possibleBoard = getPossibleBoard(player, x, board)
          const possibleScore = calcAlphaBetaPrunning(possibleBoard, PLAYER.Computer, alpha, beta)

          bestScore = Math.min(bestScore, possibleScore)
          beta = Math.min(beta, bestScore)

          if (beta <= alpha) {
            break
          }
        }
      }
    }
    
    return Math.abs(bestScore) < 2 ? bestScore : 0;
  }

  const getPossibleBoard = (player, position, board = boardState) => {
    const possibleBoard = board.slice()
    possibleBoard[position] = player
    return possibleBoard
  }

  const markBox = index => {
    if (isNaN(index)) {
      throw `"${index}" is not a number!`
    }

    if (isBlankBox(index)){
      if (isHumanTurn()) {
        boardState[index] = PLAYER.Human
        UI_BOARD[index].classList.add('human')
      } else {
        boardState[index] = PLAYER.Computer
        UI_BOARD[index].classList.add('computer')
      }
      return true
    }

    return false
  }

  const isDrawMove = (board = boardState) => {
    for (let x = 0; x < board.length; x++) {
      if (isBlankBox(x, board)) {
        return false
      }
    }
    return true
  }

  const isWinMove = (player = playerTurn, board = boardState) => {
    return getWinner(board) == player
  }

  const getWinner = (board = boardState) => {
    for (let x = 0; x < WIN_CONDITIONS.length; x++) {
      const condition = WIN_CONDITIONS[x]
      const player = board[condition[0]]

      if (player != PLAYER.Blank) {
        if (board[condition[1]] == player && board[condition[2]] == player) {
          return player
        }
      }
    }

    return false
  }

  const nextBlankBox = (from = -1, board = boardState) => {
    const index = from + 1
    if (index >= board.length) return false
    if (board[index] === 0) return index
    return nextBlank(index + 1)
  }

  const isBlankBox = (index, board = boardState) => {
    return board[index] == PLAYER.Blank
  }

  const isHumanTurn = () => {
    return playerTurn == PLAYER.Human
  }

  // ---------------------------------------------
  // Public Methods
  // ---------------------------------------------
  INSTANCE.init = () => {
    // Reset Board state
    boardState = Array(9).fill(PLAYER.Blank)

    // Reset UI Board
    UI_BOARD.forEach(item => item.classList.remove('human', 'computer'))

    if (!isHumanTurn()) {
      computerTurn()
    }
  }

  INSTANCE.setDifficulty = d => {
    if (isNaN(d)) {
      console.error(`"${d}" is not a number!`)
    }

    if (!(d >= 0 && d <= 2)) {
      console.error(`"${d}" is not between 0 and 2 (included)!`)
    }

    difficulty = d

    // Reset Points
    humanWins = 0
    computerWins = 0
    playerTurn = PLAYER.Human

    if ('function' == typeof pointsHandler) {
      pointsHandler(humanWins, computerWins)
    }

    INSTANCE.init()
  }

  INSTANCE.setWinHandler = fn => {
    winHandler = fn
  }

  INSTANCE.setDrawHandler = fn => {
    drawHandler = fn
  }

  INSTANCE.setPointsHandler = fn => {
    pointsHandler = fn
  }

  // ---------------------------------------------
  // Main Function
  // ---------------------------------------------
  UI_BOARD.forEach((item, index) => { // Bind boxes
    item.addEventListener('click', () => {
      if (isHumanTurn()) {
        if (markBox(index) && !matchHandler()) {
          playerTurn = PLAYER.Computer
          computerTurn()
        }
      }
    }, false)
  })

  INSTANCE.init() // Start Match

  return INSTANCE;
}
