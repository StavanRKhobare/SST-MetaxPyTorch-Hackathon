// ── Agent Loop ────────────────────────────────────────────────────
// Greedy coalition agent: picks the decision with highest weighted
// NPC vote support; generates a keyword-targeted coalition pitch.
// Uses refs to avoid stale-closure issues inside setTimeout.

import { useEffect, useRef, useCallback } from 'react'

// NPC agenda keywords (mirrors backend NPC_KEYWORDS)
const NPC_KEYWORDS = {
    'CTO': ['engineering', 'architecture', 'technical', 'team', 'morale', 'quality', 'platform', 'reliability'],
    'CFO': ['burn', 'cash', 'runway', 'fiduciary', 'discipline', 'cost', 'savings', 'margin', 'capital'],
    'Investor Rep': ['growth', 'scale', 'market', 'moat', 'ipo', 'exit', 'revenue', 'arr', 'bold', 'ambitious'],
    'Independent': ['reputation', 'stakeholders', 'trust', 'transparent', 'ethics', 'long-term', 'governance', 'safety'],
}

const ROLE_WEIGHT = {
    'CEO': 1.5, 'CTO': 1.2, 'CFO': 1.0, 'Investor Rep': 1.3, 'Independent': 0.8,
}

export function greedyPick(obs) {
    if (!obs?.options?.length) return null
    const tally = {}
    for (const opt of obs.options) tally[opt] = 0
    for (const npc of obs.npc_statements ?? []) {
        if (npc.vote in tally) {
            tally[npc.vote] += (ROLE_WEIGHT[npc.role] ?? 0.8) * (npc.confidence ?? 0.5)
        }
    }
    return obs.options.reduce((best, opt) => (tally[opt] > tally[best] ? opt : best), obs.options[0])
}

export function buildPitch(obs, decision) {
    if (!obs?.npc_statements) return ''
    const opposed = obs.npc_statements.filter((n) => n.vote !== decision)
    if (!opposed.length) return ''
    return opposed.map((npc) => {
        const kw = (NPC_KEYWORDS[npc.role] ?? []).slice(0, 3).join(', ')
        return `Addressing ${npc.role}: this prioritises ${kw}.`
    }).join(' ')
}

/**
 * useAgentLoop — drives the game using the greedy agent.
 * Uses a ref to always read the latest state inside the timer callback,
 * avoiding React stale-closure bugs.
 */
export function useAgentLoop(state, stepGame) {
    const { paused, loading, done, speed } = state

    // Always-fresh ref to current obs — safe to read inside setTimeout
    const obsRef = useRef(state.obs)
    const pausedRef = useRef(paused)
    const loadingRef = useRef(loading)
    const doneRef = useRef(done)
    const timerRef = useRef(null)

    // Keep refs in sync with latest state
    useEffect(() => { obsRef.current = state.obs }, [state.obs])
    useEffect(() => { pausedRef.current = paused }, [paused])
    useEffect(() => { loadingRef.current = loading }, [loading])
    useEffect(() => { doneRef.current = done }, [done])

    // Stable tick function — reads fresh state from refs
    const tick = useCallback(async () => {
        // Guard: bail if state changed while timer was pending
        if (pausedRef.current || loadingRef.current || doneRef.current) return
        const obs = obsRef.current
        if (!obs?.options?.length) return

        const decision = greedyPick(obs)
        const pitch = buildPitch(obs, decision)
        if (decision) {
            await stepGame(decision, pitch)
        }
    }, [stepGame])

    // Schedule next tick whenever key state changes
    useEffect(() => {
        clearTimeout(timerRef.current)

        // Don't schedule if blocked
        if (paused || loading || done || !state.obs?.options?.length) return

        const delay = Math.max(400, Math.round(1800 / speed))
        timerRef.current = setTimeout(tick, delay)

        return () => clearTimeout(timerRef.current)
    }, [paused, loading, done, state.obs, speed, tick])
}
