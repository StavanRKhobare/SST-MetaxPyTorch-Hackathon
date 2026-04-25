const ROLES = ['CTO', 'CFO', 'Investor Rep', 'Independent']
const KEY_MAP = { 'CTO': 'cto', 'CFO': 'cfo', 'Investor Rep': 'inv', 'Independent': 'ind' }

export default function TrustPanel({ trust, prevTrust }) {
    if (!trust) {
        return (
            <div className="card">
                <div className="section-label">Board Trust</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                    Waiting for data…
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="section-label">Board Trust</div>
            <div className="trust-list">
                {ROLES.map((role) => {
                    const val = trust[role] ?? 0.5
                    const prev = prevTrust?.[role]
                    const delta = prev !== undefined ? val - prev : null
                    const cls = KEY_MAP[role]
                    return (
                        <div key={role} className="trust-row">
                            <span className="trust-role">{role}</span>
                            <div className="trust-track">
                                <div
                                    className={`trust-fill ${cls}`}
                                    style={{ width: `${Math.round(val * 100)}%` }}
                                />
                            </div>
                            <span className="trust-pct">{Math.round(val * 100)}%</span>
                            {delta !== null && Math.abs(delta) > 0.001 ? (
                                <span className={`trust-delta ${delta > 0 ? 'pos' : 'neg'}`}>
                                    {delta > 0 ? '▲' : '▼'}
                                </span>
                            ) : (
                                <span className="trust-delta" />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
