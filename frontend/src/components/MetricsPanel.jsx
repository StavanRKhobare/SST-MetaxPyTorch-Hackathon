const formatMoney = (n) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
        : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K`
            : `$${Math.abs(n).toFixed(0)}`

const formatPct = (v) => `${(v * 100).toFixed(0)}%`
const fmtDelta = (key, d) => {
    if (key === 'revenue' || key === 'burn_rate') return formatMoney(Math.abs(d))
    if (key === 'runway_months') return `${Math.abs(d).toFixed(1)}mo`
    if (key === 'profitability_score') return Math.abs(d).toFixed(1)
    return formatPct(Math.abs(d))
}

const TILES = [
    { key: 'profitability_score', icon: '📈', label: 'Score', fmt: (v) => v.toFixed(1) },
    { key: 'revenue', icon: '💰', label: 'Revenue', fmt: formatMoney },
    { key: 'burn_rate', icon: '🔥', label: 'Burn', fmt: formatMoney },
    { key: 'runway_months', icon: '⏱', label: 'Runway', fmt: (v) => `${v.toFixed(1)}mo` },
    { key: 'product_readiness', icon: '🛠', label: 'Product', fmt: formatPct },
    { key: 'market_share', icon: '📊', label: 'Market', fmt: formatPct },
    { key: 'team_morale', icon: '💪', label: 'Morale', fmt: formatPct },
    { key: 'investor_confidence', icon: '💼', label: 'Investors', fmt: formatPct },
    { key: 'regulatory_risk', icon: '⚖', label: 'Reg Risk', fmt: formatPct },
]

function scoreTile(key, val) {
    if (key === 'regulatory_risk') return val > 0.65 ? 'bad' : val > 0.35 ? 'warn' : 'good'
    if (key === 'runway_months') return val > 12 ? 'good' : val > 6 ? 'warn' : 'bad'
    if (key === 'profitability_score') return val >= 60 ? 'good' : val >= 35 ? 'warn' : 'bad'
    if (key === 'burn_rate') return ''
    return val > 0.65 ? 'good' : val > 0.35 ? 'warn' : 'bad'
}

export default function MetricsPanel({ state, prevState }) {
    if (!state) return null

    return (
        <div className="metrics-strip">
            {TILES.map(({ key, icon, label, fmt }) => {
                const val = state[key] ?? 0
                const prev = prevState?.[key]
                const delta = prev !== undefined ? val - prev : null
                const cls = scoreTile(key, val)
                return (
                    <div key={key} className="metric-tile">
                        <div className="m-icon-label">
                            <span className="m-icon">{icon}</span>
                            <span className="m-label">{label}</span>
                        </div>
                        <div className="m-value-row">
                            <span className={`m-value ${cls}`}>{fmt(val)}</span>
                            {delta !== null && Math.abs(delta) > 0.001 && (
                                <span className={`m-delta ${delta > 0 ? 'pos' : 'neg'}`}>
                                    {delta > 0 ? '+' : '−'}{fmtDelta(key, delta)}
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
