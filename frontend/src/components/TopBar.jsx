import { useEffect, useState } from 'react'
import { apiHealth } from '../services/api.js'

export default function TopBar({ obs, round }) {
    const [online, setOnline] = useState(false)

    useEffect(() => {
        const check = async () => setOnline(await apiHealth())
        check()
        const id = setInterval(check, 15_000)
        return () => clearInterval(id)
    }, [])

    const score = obs?.state?.profitability_score ?? null
    const scoreClass = score === null ? '' : score >= 60 ? 'good' : score >= 35 ? 'warn' : 'bad'

    return (
        <div className="topbar">
            <div className="topbar-brand">
                <div className="brand-logo">🧠</div>
                <div>
                    <div className="brand-name">NeuralEdge Boardroom</div>
                    <div className="brand-ceo">Sarah Chen · CEO &mdash; AI Agent</div>
                </div>
            </div>

            <div className="topbar-center">
                <div className="round-badge">
                    {obs ? `Round ${round} / 10` : '— / 10'}
                </div>
                {score !== null && (
                    <div className="score-display">
                        <div className="score-label">Profitability</div>
                        <div className={`score-value ${scoreClass}`}>{score.toFixed(1)}</div>
                    </div>
                )}
            </div>

            <div className="topbar-right">
                <div className="health-indicator">
                    <div className={`health-dot ${online ? 'online' : 'offline'}`} />
                    {online ? 'Backend online' : 'Backend offline'}
                </div>
            </div>
        </div>
    )
}
