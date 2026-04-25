const formatMoney = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
        : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K`
            : `$${n?.toFixed(0) ?? 0}`

const OUTCOME_MAP = {
    ipo: { icon: '🚀', title: 'IPO Success!', cls: 'ipo' },
    acquisition: { icon: '🏆', title: 'Acquired!', cls: 'acquisition' },
    runway_exhausted: { icon: '💀', title: 'Bankruptcy', cls: 'bankruptcy' },
    finished_10: { icon: '🏁', title: 'Episode Complete', cls: 'default' },
}

export default function EndScreen({ obs, onReplay }) {
    if (!obs) return null
    const { state } = obs
    const reason = state?.done_reason ?? 'finished_10'
    const { icon, title, cls } = OUTCOME_MAP[reason] ?? OUTCOME_MAP['finished_10']
    const history = state?.history ?? []

    return (
        <div className="end-overlay">
            <div className="end-modal">
                <div className="end-icon">{icon}</div>
                <div className="end-title">{title}</div>
                <span className={`end-reason ${cls}`}>{reason.replace(/_/g, ' ')}</span>

                <div className="end-stats">
                    <div className="end-stat">
                        <div className="es-label">Profit Score</div>
                        <div className="es-value" style={{ color: 'var(--amber)' }}>
                            {(state?.profitability_score ?? 0).toFixed(1)}
                        </div>
                    </div>
                    <div className="end-stat">
                        <div className="es-label">Revenue</div>
                        <div className="es-value">{formatMoney(state?.revenue ?? 0)}</div>
                    </div>
                    <div className="end-stat">
                        <div className="es-label">Runway Left</div>
                        <div className="es-value">{(state?.runway_months ?? 0).toFixed(1)} mo</div>
                    </div>
                    <div className="end-stat">
                        <div className="es-label">Rounds Won</div>
                        <div className="es-value" style={{ color: 'var(--green)' }}>
                            {history.filter(h => h.agent_won_vote).length} / {history.length}
                        </div>
                    </div>
                    <div className="end-stat">
                        <div className="es-label">Team Morale</div>
                        <div className="es-value">{Math.round((state?.team_morale ?? 0) * 100)}%</div>
                    </div>
                    <div className="end-stat">
                        <div className="es-label">Reg Risk</div>
                        <div className="es-value">{Math.round((state?.regulatory_risk ?? 0) * 100)}%</div>
                    </div>
                </div>

                {history.length > 0 && (
                    <div style={{ marginBottom: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                        <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Round Log
                        </div>
                        {history.map((h) => (
                            <div key={h.round} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '0.2rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>R{h.round}</span>
                                <span style={{ flex: 1, marginLeft: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(h.event_title ?? '').split('—').slice(-1)[0]?.trim()}
                                </span>
                                <span style={{ marginLeft: '0.5rem', color: h.agent_won_vote ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                                    {h.agent_won_vote ? '✓' : '✗'} {(h.agent_decision ?? '').replace(/_/g, ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <button className="replay-btn" onClick={onReplay}>
                    ↺ Run New Episode
                </button>
            </div>
        </div>
    )
}
