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

"use strict";

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
    let score = -2
    let move = -1

    for (let x = 0; x < boardState.length; x++) {
      if (isBlankBox(x)) {
        const clonedBoard = boardState.slice()
        clonedBoard[x] = PLAYER.Computer

        const nextMoveScore = -calcMiniMax(clonedBoard, PLAYER.Human)
        if (nextMoveScore > score) {
          score = nextMoveScore
          move = x
        }
      }
    }

    return move
  }

  const calcMiniMax = (board, player) => {
    const winner = getWinner(board)
    if (winner !== false) {
      return winner * player
    }

    let score = -2
    let move = -1

    for (let x = 0; x < board.length; x++) {
      if (isBlankBox(x, board)) {
        const clonedBoard = board.slice()
        clonedBoard[x] = player

        const nextMoveScore = -calcMiniMax(clonedBoard, getOpponentFor(player))
        if (nextMoveScore > score) {
            score = nextMoveScore
            move = x
        } 
      }
    }

    if (move == -1) {
      return 0 // Can't move ==> draw!
    }

    return score
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

  const isBlankBox = (index, board = boardState) => {
    return board[index] == PLAYER.Blank
  }

  const isHumanTurn = () => {
    return playerTurn == PLAYER.Human
  }

  const getOpponentFor = (player = playerTurn) => {
    if (player !== 1 && player !== -1) {
      throw `${player} is not a valid input!`
    }

    return -1 * player
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
