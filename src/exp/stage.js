/* The Urmil Gambit — stage controller.
   One persistent board; acts play out on it as scenes. Pieces glide via
   absolutely-positioned layers so every move is animated, not swapped. */

import { ACTS, FINALE } from './scenes.js'
import { PERSONAS } from '../journey/personas.js'

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const SPRITES = {
  K: 'klt', Q: 'qlt', R: 'rlt', B: 'blt', N: 'nlt', P: 'plt',
  k: 'kdt', q: 'qdt', r: 'rdt', b: 'bdt', n: 'ndt', p: 'pdt',
}

const posOf = (sq) => {
  const file = FILES.indexOf(sq[0])
  const rank = Number(sq[1])
  return { left: `${file * 12.5}%`, top: `${(8 - rank) * 12.5}%` }
}

export const createStage = (root, { onFreePlay, onAskTwin }) => {
  const el = (sel) => root.querySelector(sel)
  const actEl = el('.exp__act')
  const finaleEl = el('.exp__finale')
  const boardEl = el('.exp__board')
  const piecesEl = el('.exp__pieces')
  const labelEl = el('.exp__label')
  const titleEl = el('.exp__title')
  const narrEl = el('.exp__narr')
  const nextBtn = el('.exp__nextbtn')
  const crumbsEl = el('.exp__crumbs')

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let actIndex = -1
  let awaiting = null /* {from, to} while waiting for the player's tap */
  let selectedFrom = false
  let hintTimer = null

  /* ---- board scaffolding (squares once, pieces per act) ---- */
  const buildSquares = () => {
    for (let rank = 8; rank >= 1; rank -= 1) {
      for (let file = 0; file < 8; file += 1) {
        const sq = `${FILES[file]}${rank}`
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = `xsq ${(file + rank) % 2 === 0 ? 'xsq--dark' : 'xsq--light'}`
        btn.dataset.sq = sq
        btn.setAttribute('aria-label', sq.toLowerCase())
        btn.addEventListener('click', () => onTap(sq))
        boardEl.appendChild(btn)
      }
    }
  }

  const sqBtn = (sq) => boardEl.querySelector(`[data-sq="${sq}"]`)

  const clearHighlights = () => {
    boardEl
      .querySelectorAll('.xsq--from, .xsq--to, .xsq--forked, .xsq--mate')
      .forEach((b) => b.classList.remove('xsq--from', 'xsq--to', 'xsq--forked', 'xsq--mate'))
  }

  const setPieces = (board) => {
    piecesEl.innerHTML = ''
    Object.entries(board).forEach(([sq, piece]) => {
      const img = document.createElement('img')
      img.src = `/pieces/${SPRITES[piece]}.svg`
      img.alt = ''
      img.draggable = false
      img.className = 'xpiece'
      img.dataset.sq = sq
      Object.assign(img.style, posOf(sq))
      piecesEl.appendChild(img)
    })
  }

  const pieceAt = (sq) => piecesEl.querySelector(`[data-sq="${sq}"]`)

  const glide = (from, to) =>
    new Promise((resolve) => {
      const piece = pieceAt(from)
      if (!piece) return resolve()
      const victim = pieceAt(to)
      piece.dataset.sq = to
      Object.assign(piece.style, posOf(to))
      const ms = reducedMotion ? 0 : 480
      setTimeout(() => {
        if (victim) victim.remove()
        resolve()
      }, ms)
    })

  /* ---- narration ---- */
  const narrate = (text, tag) => {
    narrEl.classList.remove('narr--in')
    setTimeout(() => {
      narrEl.textContent = ''
      if (tag) {
        const t = document.createElement('span')
        t.className = 'narr__tag'
        t.textContent = tag
        narrEl.appendChild(t)
      }
      narrEl.appendChild(document.createTextNode(text))
      narrEl.classList.add('narr--in')
    }, 160)
  }

  /* ---- crumbs ---- */
  const renderCrumbs = () => {
    crumbsEl.innerHTML = ''
    ACTS.forEach((act, i) => {
      const li = document.createElement('li')
      li.textContent = act.crumb
      if (i < actIndex) li.className = 'done'
      if (i === actIndex) li.className = 'now'
      crumbsEl.appendChild(li)
    })
  }

  /* ---- act flow ---- */
  const startAct = (i) => {
    actIndex = i
    const act = ACTS[i]
    clearHighlights()
    clearTimeout(hintTimer)
    awaiting = { ...act.task }
    selectedFrom = false
    nextBtn.hidden = true

    labelEl.textContent = act.label
    titleEl.textContent = act.title
    titleEl.classList.remove('exp__title--in')
    requestAnimationFrame(() =>
      requestAnimationFrame(() => titleEl.classList.add('exp__title--in'))
    )

    piecesEl.classList.add('xpieces--fade')
    setTimeout(
      () => {
        setPieces(act.board)
        piecesEl.classList.remove('xpieces--fade')
        sqBtn(act.task.from).classList.add('xsq--from')
        narrate(act.prompt)
        /* if they hesitate, glow the destination too */
        hintTimer = setTimeout(() => {
          if (awaiting) sqBtn(act.task.to).classList.add('xsq--to')
        }, 4000)
      },
      reducedMotion ? 0 : 350
    )
    renderCrumbs()
  }

  const completeAct = async () => {
    const act = ACTS[actIndex]
    clearTimeout(hintTimer)
    clearHighlights()
    const task = awaiting
    awaiting = null

    await glide(task.from, task.to)
    if (act.extra) await glide(act.extra.from, act.extra.to)
    if (act.forked) {
      act.forked.forEach((sq) => sqBtn(sq).classList.add('xsq--forked'))
    }
    if (act.mate) {
      act.mate.forEach((sq) => sqBtn(sq).classList.add('xsq--mate'))
    }
    if (act.reply) {
      narrate(act.replyLine || '…')
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 700))
      await glide(act.reply.from, act.reply.to)
    }
    narrate(act.payoff.text, act.payoff.tag)
    nextBtn.textContent = actIndex === ACTS.length - 1 ? 'endgame →' : 'next move →'
    nextBtn.hidden = false
    nextBtn.focus({ preventScroll: true })
  }

  const onTap = (sq) => {
    if (!awaiting) return
    if (sq === awaiting.to && (selectedFrom || true)) {
      completeAct()
      return
    }
    if (sq === awaiting.from) {
      selectedFrom = true
      sqBtn(awaiting.to).classList.add('xsq--to')
      return
    }
    /* wrong square: nudge */
    const btn = sqBtn(sq)
    btn.classList.add('xsq--nope')
    setTimeout(() => btn.classList.remove('xsq--nope'), 350)
  }

  const showFinale = () => {
    actIndex = ACTS.length
    renderCrumbs()
    actEl.hidden = true
    finaleEl.hidden = false
    finaleEl.querySelector('.exp__headline').textContent = FINALE.headline
    const persona = PERSONAS[document.documentElement.dataset.persona]
    finaleEl.querySelector('.exp__finline').textContent = persona
      ? persona.finaleLine
      : FINALE.line
  }

  /* ---- wiring ---- */
  nextBtn.addEventListener('click', () => {
    if (actIndex >= ACTS.length - 1) showFinale()
    else startAct(actIndex + 1)
  })

  root.querySelectorAll('.exp__skipall').forEach((btn) =>
    btn.addEventListener('click', () => {
      actEl.hidden = true
      showFinale()
    })
  )

  finaleEl.querySelector('.exp__freeplaybtn').addEventListener('click', onFreePlay)
  finaleEl.querySelector('.exp__twinbtn').addEventListener('click', onAskTwin)
  finaleEl.querySelector('.exp__replay').addEventListener('click', () => {
    finaleEl.hidden = true
    actEl.hidden = false
    startAct(0)
  })

  buildSquares()
  setPieces(ACTS[0].board)

  /* auto-start the story when the board scrolls into view */
  let started = false
  const startIfFresh = () => {
    if (started) return
    started = true
    finaleEl.hidden = true
    actEl.hidden = false
    startAct(0)
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          startIfFresh()
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(root)
  } else {
    startIfFresh()
  }

  return {
    startStory: () => {
      started = true
      finaleEl.hidden = true
      actEl.hidden = false
      startAct(0)
    },
    showFinale,
  }
}
