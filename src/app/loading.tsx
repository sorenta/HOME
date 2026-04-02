export default function Loading() {
  return (
    <div className="maj-splash-shell">
      <div className="maj-splash-card">
        <div className="maj-ho-mark mx-auto">
          <span className="maj-ho-mark-text">H:O</span>
        </div>
        <p className="maj-splash-kicker">HOME:OS</p>
        <p className="maj-splash-title">Ielādē mājas ritmu</p>
        <p className="maj-splash-copy">
          Gaiša, mierīga un sakārtota telpa tavai ikdienai.
        </p>
        <div className="maj-splash-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
