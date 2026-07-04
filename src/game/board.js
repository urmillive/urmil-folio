/* Playable chess vs Urmil's engine, DOM board, js-chess-engine brain.
   Piece art: Cburnett chess set (Wikimedia Commons, GPLv2+/BSD). */

import jce from 'js-chess-engine'
import {
  CAREER_BEATS,
  PROJECT_UNLOCKS,
  TAUNTS,
  CAPTURE_LINES,
  STATUS_LINES,
  PIECE_NAMES,
} from './beats.js'

const Game = jce.Game

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const AI_LEVEL = 2
const AI_DELAY_MS = 350

const SPRITES = {
  K: 'klt', Q: 'qlt', R: 'rlt', B: 'blt', N: 'nlt', P: 'plt',
  k: 'kdt', q: 'qdt', r: 'rdt', b: 'bdt', n: 'ndt', p: 'pdt',
}

export const createChessHero = ({ boardEl, narrationEl, progressEl, newGameBtn, overlayEl }) => {
  let game
  let selected = null
  let legalTargets = []
  let lastMove = []
  let aiMoveCount = 0
  let capturesByPlayer = 0
  let thinking = false
  let narrTimer = null

  /* ---- narration ---- */
  const narrate = (text, tag) => {
    clearTimeout(narrTimer)
    narrationEl.classList.remove('narr--in')
    narrTimer = setTimeout(() => {
      narrationEl.innerHTML = tag
        ? `<span class="narr__tag">${tag}</span>${text}`
        : text
      narrationEl.classList.add('narr--in')
    }, 180)
  }

  const updateProgress = () => {
    const n = Math.min(aiMoveCount, CAREER_BEATS.length)
    progressEl.textContent = `story ${n}/${CAREER_BEATS.length} · captures ${capturesByPlayer}`
  }

  /* ---- board rendering ---- */
  const squareName = (file, rank) => `${FILES[file]}${rank}`

  const buildSquares = () => {
    boardEl.innerHTML = ''
    for (let rank = 8; rank >= 1; rank -= 1) {
      for (let file = 0; file < 8; file += 1) {
        const sq = squareName(file, rank)
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = `sq ${(file + rank) % 2 === 0 ? 'sq--dark' : 'sq--light'}`
        btn.dataset.sq = sq
        if (file === 0) btn.dataset.rank = rank
        if (rank === 1) btn.dataset.file = FILES[file].toLowerCase()
        btn.addEventListener('click', () => onSquareTap(sq))
        boardEl.appendChild(btn)
      }
    }
  }

  const render = () => {
    const state = game.exportJson()
    const checkSq = state.check
      ? Object.entries(state.pieces).find(
          ([, p]) => p === (state.turn === 'white' ? 'K' : 'k')
        )?.[0]
      : null

    boardEl.querySelectorAll('.sq').forEach((btn) => {
      const sq = btn.dataset.sq
      const piece = state.pieces[sq]
      btn.innerHTML = piece
        ? `<img src="/pieces/${SPRITES[piece]}.svg" alt="" draggable="false" />`
        : ''
      const pieceName = piece ? PIECE_NAMES[piece.toLowerCase()] : null
      btn.setAttribute(
        'aria-label',
        pieceName
          ? `${sq.toLowerCase()}, ${piece === piece.toUpperCase() ? 'white' : 'black'} ${pieceName}`
          : sq.toLowerCase()
      )
      btn.classList.toggle('sq--selected', sq === selected)
      btn.classList.toggle('sq--target', legalTargets.includes(sq))
      btn.classList.toggle('sq--last', lastMove.includes(sq))
      btn.classList.toggle('sq--check', sq === checkSq)
    })
  }

  /* ---- FLIP glide: the moved piece slides instead of teleporting ---- */
  const animateMove = (from, to) => {
    const img = boardEl.querySelector(`[data-sq="${to}"] img`)
    const fromBtn = boardEl.querySelector(`[data-sq="${from}"]`)
    if (!img || !fromBtn) return
    const a = fromBtn.getBoundingClientRect()
    const b = img.getBoundingClientRect()
    const dx = a.left - b.left
    const dy = a.top - b.top
    img.style.transition = 'none'
    img.style.transform = `translate(${dx}px, ${dy}px)`
    img.style.willChange = 'transform'
    void img.offsetWidth /* force reflow so the start position paints */
    img.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.8, 0.3, 1)'
    img.style.transform = ''
    img.addEventListener(
      'transitionend',
      () => {
        img.style.transition = ''
        img.style.willChange = ''
      },
      { once: true }
    )
  }

  /* ---- endgame overlay ---- */
  const showOverlay = (headline, line) => {
    overlayEl.querySelector('.gameover__headline').textContent = headline
    overlayEl.querySelector('.gameover__line').textContent = line
    overlayEl.hidden = false
  }

  const checkEnd = (state, playerJustMoved) => {
    if (!state.isFinished) return false
    if (state.checkMate) {
      const line = playerJustMoved ? STATUS_LINES.playerWins : STATUS_LINES.aiWins
      narrate(line)
      showOverlay(playerJustMoved ? 'You win.' : 'Checkmate.', line)
    } else {
      narrate(STATUS_LINES.draw)
      showOverlay('A draw.', STATUS_LINES.draw)
    }
    return true
  }

  /* ---- moves ---- */
  const doPlayerMove = (from, to) => {
    const before = game.exportJson().pieces
    const captured = before[to]
    game.move(from, to)
    lastMove = [from, to]
    selected = null
    legalTargets = []
    render()
    animateMove(from, to)

    if (captured) {
      capturesByPlayer += 1
      const project = PROJECT_UNLOCKS[(capturesByPlayer - 1) % PROJECT_UNLOCKS.length]
      narrate(CAPTURE_LINES.playerTakes(PIECE_NAMES[captured.toLowerCase()], project))
    }
    updateProgress()

    const state = game.exportJson()
    if (checkEnd(state, true)) return

    thinking = true
    boardEl.classList.add('board--thinking')
    setTimeout(aiReply, AI_DELAY_MS)
  }

  const aiReply = () => {
    const before = game.exportJson().pieces
    const moveObj = game.aiMove(AI_LEVEL)
    const [from, to] = Object.entries(moveObj)[0]
    const captured = before[to]
    lastMove = [from, to]
    thinking = false
    boardEl.classList.remove('board--thinking')
    aiMoveCount += 1
    render()
    animateMove(from, to)
    updateProgress()

    const state = game.exportJson()
    if (checkEnd(state, false)) return

    if (aiMoveCount <= CAREER_BEATS.length) {
      const beat = CAREER_BEATS[aiMoveCount - 1]
      narrate(beat.text, beat.tag)
    } else if (captured) {
      narrate(CAPTURE_LINES.aiTakes(PIECE_NAMES[captured.toLowerCase()]))
    } else if (state.check) {
      narrate(STATUS_LINES.check)
    } else {
      narrate(TAUNTS[(aiMoveCount - CAREER_BEATS.length - 1) % TAUNTS.length])
    }
  }

  const onSquareTap = (sq) => {
    if (thinking) return
    const state = game.exportJson()
    if (state.isFinished || state.turn !== 'white') return

    if (selected && legalTargets.includes(sq)) {
      doPlayerMove(selected, sq)
      return
    }

    const piece = state.pieces[sq]
    if (piece && piece === piece.toUpperCase()) {
      const allMoves = game.moves()
      selected = sq
      legalTargets = allMoves[sq] || []
    } else {
      selected = null
      legalTargets = []
    }
    render()
  }

  /* ---- lifecycle ---- */
  const reset = () => {
    game = new Game()
    selected = null
    legalTargets = []
    lastMove = []
    aiMoveCount = 0
    capturesByPlayer = 0
    thinking = false
    overlayEl.hidden = true
    render()
    updateProgress()
    narrate(
      'You are white, I am the engine Urmil trained. Make a move: my first six replies tell his story, and every piece you capture unlocks something he shipped.'
    )
  }

  newGameBtn.addEventListener('click', reset)
  overlayEl.querySelector('.gameover__again').addEventListener('click', reset)

  buildSquares()
  reset()
}
