export default function PlaybackControls({
    paused,
    loading,
    done,
    obs,
    speed,
    onRun,
    onPause,
    onStep,
    onReset,
    onSpeedChange,
}) {
    const canStep = !loading && !done && !!obs
    const statusText = loading ? 'Processing…'
        : done ? 'Episode complete'
            : paused ? 'Paused'
                : 'Running'

    const statusDot = loading ? '' : done ? '' : paused ? 'paused' : 'running'

    return (
        <div className="playback-bar">
            {paused && !done ? (
                <button className="pb-btn primary" onClick={onRun} disabled={loading || !obs}>
                    ▶ Run Agent
                </button>
            ) : (
                <button className="pb-btn" onClick={onPause} disabled={loading || done}>
                    ⏸ Pause
                </button>
            )}

            <button className="pb-btn" onClick={onStep} disabled={!canStep}>
                ⏭ Step
            </button>

            <div className="pb-divider" />

            <button className="pb-btn" onClick={onReset} disabled={loading}>
                ↺ Reset
            </button>

            <div className="pb-divider" />

            <div className="speed-control">
                <span>Speed</span>
                <input
                    type="range"
                    min={0.5}
                    max={4}
                    step={0.25}
                    value={speed}
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                />
                <span className="speed-label">{speed.toFixed(2)}×</span>
            </div>

            <div className="pb-status">
                <div className={`status-dot ${statusDot}`} />
                {statusText}
            </div>
        </div>
    )
}
