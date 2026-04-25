export default function EventBanner({ event, round }) {
    if (!event) {
        return (
            <div className="event-banner">
                <div className="event-tag">⚡ Board Crisis</div>
                <div className="event-title">Awaiting scenario…</div>
                <div className="event-desc">Click Run Agent to begin the episode.</div>
            </div>
        )
    }

    // event string is "Title — Description" or "Title\nDescription: ..."
    const [titlePart, ...rest] = event.split('\n')
    const desc = rest.join(' ').replace(/^Description:\s*/i, '').trim() || event

    return (
        <div className="event-banner">
            <div className="event-tag">
                ⚡ Round {round} Board Crisis
            </div>
            <div className="event-title">{titlePart}</div>
            {desc && desc !== titlePart && (
                <div className="event-desc">{desc}</div>
            )}
        </div>
    )
}
