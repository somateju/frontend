function DataPage({
  title,
  onBack,
  children,
}) {
  return (
    <div className="data-page">

      <button
        className="back-dashboard"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <h1>{title}</h1>

      <div className="data-content">
        <div className="table-container">
          {children}
        </div>
      </div>

    </div>
  );
}

export default DataPage;