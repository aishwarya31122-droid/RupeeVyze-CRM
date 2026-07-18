export default function FunnelChart({ stages }) {
  if (!stages || stages.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b", padding: "2rem" }}>
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="funnel-chart-container">
      {stages.map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        const dropOffPercent = index > 0 ? Math.round(((stages[index - 1].count - item.count) / stages[index - 1].count) * 100) : 0;

        return (
          <div key={item.stage} className="funnel-stage">
            <div className="funnel-bar-wrapper">
              <div className="funnel-bar-container">
                <div
                  className="funnel-bar"
                  style={{
                    width: `${percentage}%`,
                    opacity: 1 - (index * 0.1)
                  }}
                >
                  <span className="funnel-count">{item.count}</span>
                </div>
              </div>
              <span className="funnel-label">{item.stage}</span>
              {dropOffPercent > 0 && (
                <span className="funnel-dropoff">↓ {dropOffPercent}% drop</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
