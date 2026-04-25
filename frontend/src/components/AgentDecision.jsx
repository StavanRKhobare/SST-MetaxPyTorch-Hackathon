const OPTION_ICONS = {
    slash_prices: '💸', differentiate: '🔬', acquire_startup: '🏢',
    accept_deal: '🤝', negotiate_terms: '⚖', reject_deal: '🚫',
    match_offers: '💰', partial_match: '🔶', let_them_leave: '🚪',
    full_compliance: '📜', partial_compliance: '📋', exit_EU_market: '🌐',
    public_apology: '🗣', legal_action: '⚖', rebrand: '🔄',
    accept_acquisition: '🏆', counter_offer: '🤜', reject_and_raise: '📈',
    accept_terms: '✅', negotiate: '🔀', bootstrap: '💪',
    pivot_product: '🎯', license_technology: '📡', keep_internal: '🔒',
    full_transparency: '🔍', damage_control: '🛡', internal_investigation: '🔎',
    ipo: '🚀', acquisition: '💼', stay_private: '🏠',
}
const iconFor = (k) => OPTION_ICONS[k] ?? '🎯'

export default function AgentDecision({ obs, loading, lastInfo }) {
    if (!obs) return null

    const winningDecision = obs.state?.winning_decision ?? null
    const aiDecision = lastInfo?.winning_decision ?? winningDecision
    const options = obs.options ?? []

    // Get coalition pitch from last history entry
    const history = obs.state?.history ?? []
    const lastEntry = history[history.length - 1]
    const pitch = lastEntry?.pitch_used ? '(pitch used)' : ''

    // If currently loading, show thinking state
    if (loading && !winningDecision) {
        return (
            <div className="card">
                <div className="section-label">Agent Decision</div>
                <div className="ai-thinking">
                    <span>Sarah Chen is deliberating</span>
                    <div className="thinking-dots">
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="section-label">Agent Decision</div>
            <div className="agent-decision-panel">
                <div className="decision-options-grid">
                    {options.map((opt) => {
                        const isAiPick = opt === aiDecision
                        const isWinner = opt === winningDecision
                        const isMatch = aiDecision === winningDecision
                        let cls = 'decision-option'
                        if (isAiPick) cls += ' ai-pick'
                        if (isWinner && winningDecision) cls += ` board-winner ${isMatch ? 'board-match' : 'board-mismatch'}`
                        return (
                            <div key={opt} className={cls}>
                                <div className="opt-icon">{iconFor(opt)}</div>
                                <div className="opt-label">{opt.replace(/_/g, ' ')}</div>
                            </div>
                        )
                    })}
                </div>

                {winningDecision && aiDecision && aiDecision !== winningDecision && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontFamily: 'var(--font-mono)', padding: '0.375rem' }}>
                        ⚠ AI was outvoted. Board chose: {winningDecision.replace(/_/g, ' ')}
                    </div>
                )}

                {lastEntry && (
                    <div className="coalition-pitch-block">
                        <div className="pitch-header">Coalition Pitch</div>
                        <div className={`pitch-text ${lastEntry.pitch_used ? '' : 'empty'}`}>
                            {lastEntry.pitch_used
                                ? `[Targeting ${Object.entries(lastEntry.pitch_scores ?? {}).filter(([, v]) => v > 0).map(([r]) => r).join(', ')}] — keyword-optimised pitch sent.`
                                : 'No pitch sent this round.'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
