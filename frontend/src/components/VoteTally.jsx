export default function VoteTally({ info }) {
    const tally = info?.winning_vote_tally
    if (!tally) return null

    const winner = Object.entries(tally).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0])[0]
    const max = Math.max(...Object.values(tally), 0.01)

    return (
        <div className="card">
            <div className="section-label">Vote Tally</div>
            <div className="vote-tally">
                {Object.entries(tally).map(([opt, val]) => (
                    <div key={opt} className="tally-row">
                        <span className="tally-label">{opt.replace(/_/g, ' ')}</span>
                        <div className="tally-track">
                            <div
                                className={`tally-fill ${opt === winner ? 'winner' : ''}`}
                                style={{ width: `${Math.round((val / max) * 100)}%` }}
                            />
                        </div>
                        <span className="tally-value">{val.toFixed(1)}</span>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                Board winner: <span style={{ color: 'var(--green)' }}>{winner.replace(/_/g, ' ')}</span>
            </div>
        </div>
    )
}
