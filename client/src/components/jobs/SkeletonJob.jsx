const SkeletonJob = () => (
  <div className="job-card skeleton-job">
    <div className="job-card-header">
      <div className="skeleton-circle shimmer" />
      <div style={{ flex: 1 }}>
        <div
          className="skeleton-line shimmer"
          style={{ width: "60%", height: 16 }}
        />
        <div
          className="skeleton-line shimmer"
          style={{ width: "30%", height: 12, marginTop: 6 }}
        />
      </div>
    </div>
    <div
      className="skeleton-line shimmer"
      style={{ width: "100%", height: 12, marginTop: 12 }}
    />
    <div
      className="skeleton-line shimmer"
      style={{ width: "80%", height: 12, marginTop: 6 }}
    />
    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
      <div
        className="skeleton-line shimmer"
        style={{ width: 60, height: 20 }}
      />
      <div
        className="skeleton-line shimmer"
        style={{ width: 50, height: 20 }}
      />
    </div>
  </div>
);

export default SkeletonJob;
