
import { useEffect, useRef, useState } from 'react';

const coachingMoves = [
  [
    '01',
    'Quantify your product impact',
    'Add a metric to your design-system achievement.',
    'High impact',
  ],
  [
    '02',
    'Tailor your headline',
    'Lead with the outcome you create, not your title.',
    'Quick win',
  ],
  [
    '03',
    'Build your portfolio narrative',
    'Turn project details into a compelling case study.',
    'AI guided',
  ],
];

function UploadPanel({ file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const selectFile = (nextFile) => {
    if (nextFile) onFile(nextFile);
  };

  return (
    <div
      className={`upload-panel ${dragging ? 'dragging' : ''} ${
        file ? 'selected' : ''
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files[0]);
      }}
    >
      <div className="upload-icon">↑</div>

      <div className="upload-copy">
        <strong>
          {file?.name || 'Drop your resume here'}
        </strong>

        <span>
          {file
            ? 'Ready for AI analysis'
            : 'PDF or DOCX · up to 10 MB'}
        </span>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Browse
      </button>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(event) =>
          selectFile(event.target.files?.[0])
        }
      />
    </div>
  );
}

function ScoreCard({
  onViewReport,
  onRerunAnalysis,
  onRemoveAnalysis,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="score-card">
      <div className="score-top">
        <span>ROLE TO MATCH</span>

        <div className="score-menu-wrapper">
          <button
            type="button"
            aria-label="More options"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(
                (current) => !current
              )
            }
          >
            •••
          </button>

          {menuOpen && (
            <div className="score-menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onViewReport();
                }}
              >
                <span>↗</span>
                View full report
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRerunAnalysis();
                }}
              >
                <span>↻</span>
                Re-run analysis
              </button>

              <div className="score-menu-divider" />

              <button
                type="button"
                className="score-remove"
                onClick={() => {
                  setMenuOpen(false);
                  onRemoveAnalysis();
                }}
              >
                <span>×</span>
                Remove analysis
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="score">
        <svg
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle
            className="track"
            cx="60"
            cy="60"
            r="48"
          />

          <circle
            className="progress"
            cx="60"
            cy="60"
            r="48"
          />
        </svg>

        <div>
          <strong>82</strong>
          <small>/100</small>
        </div>
      </div>

      <p>
        <b>Strong match</b> for this role.
      </p>

      <small>
        + 6 points since last review
      </small>
    </article>
  );
}

function FullReport({
  onBack,
  aiAnalysis,
  targetRole,
}) {
  const downloadReport = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/download-report',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            analysis: aiAnalysis,
            targetRole,
            candidateName:
              aiAnalysis?.candidateName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Could not generate report'
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement('a');

      link.href = url;
      link.download =
        'Hirely-Resume-Report.pdf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        'Download error:',
        error
      );
    }
  };

  return (
    <section className="report-page">
      <div className="report-header">
        <div>
          <button
            className="text-button"
            type="button"
            onClick={onBack}
          >
            ← Back to Overview
          </button>

          <p className="eyebrow">
            AI RESUME REPORT
          </p>

          <h1>
            {targetRole} <span>•</span> Hirely
          </h1>

          <p className="muted">
            Your latest resume analysis and AI
            recommendations.
          </p>
        </div>

        <button onClick={downloadReport}>
          Download Report ↓
        </button>
      </div>

      <section className="report-score-section">
        <div className="report-score">
          <p className="eyebrow">
            OVERALL MATCH
          </p>

          <div className="report-score-number">
            <strong>
              {aiAnalysis?.overallScore ??
                '--'}
            </strong>

            <span>/100</span>
          </div>

          <h3>
            {aiAnalysis?.overallScore >= 80
              ? 'Strong match'
              : aiAnalysis?.overallScore >= 60
                ? 'Good match'
                : 'Needs improvement'}
          </h3>

          <p className="muted">
            Your experience aligns well with this{' '}
            {targetRole} role.
          </p>
        </div>

        <div className="report-summary">
          <div>
            <span>
              ATS Compatibility
            </span>

            <strong>
              {aiAnalysis?.atsCompatibility ??
                '--'}
              %
            </strong>
          </div>

          <div>
            <span>
              Experience Match
            </span>

            <strong>
              {aiAnalysis?.experienceMatch ??
                '--'}
              %
            </strong>
          </div>

          <div>
            <span>Skills Match</span>

            <strong>
              {aiAnalysis?.skillsMatch ??
                '--'}
              %
            </strong>
          </div>
        </div>
      </section>

      <section className="report-grid">
        <article className="report-card">
          <p className="eyebrow">
            AI ANALYSIS
          </p>

          <h2>
            Your resume assessment
          </h2>

          {aiAnalysis ? (
            <div className="ai-analysis-content">
              <p>
                <strong>
                  Overall Score:
                </strong>{' '}
                {aiAnalysis.overallScore}
                /100
              </p>

              <p>
                <strong>
                  ATS Compatibility:
                </strong>{' '}
                {aiAnalysis.atsCompatibility}
                %
              </p>

              <p>
                <strong>
                  Experience Match:
                </strong>{' '}
                {aiAnalysis.experienceMatch}
                %
              </p>

              <p>
                <strong>
                  Skills Match:
                </strong>{' '}
                {aiAnalysis.skillsMatch}
                %
              </p>
            </div>
          ) : (
            <p className="muted">
              Run an AI analysis to generate
              your personalized resume report.
            </p>
          )}
        </article>

        <article className="report-card">
          <p className="eyebrow">
            TOP OPPORTUNITIES
          </p>

          <h2>
            Close these skill gaps
          </h2>

          <div className="tags">
            {aiAnalysis?.skillGaps?.map(
              (gap, index) => (
                <span key={index}>
                  {gap}
                </span>
              )
            )}
          </div>

          <p className="muted">
            Improving these areas could
            significantly increase your match
            score for this role.
          </p>
        </article>
      </section>

      <section className="report-card recommendations">
        <p className="eyebrow">
          AI COACHING PLAN
        </p>

        <h2>
          Next best moves
        </h2>

        <div className="report-move-list">
          {aiAnalysis?.recommendations?.map(
            (
              recommendation,
              index
            ) => (
              <div
                className="report-move"
                key={index}
              >
                <span>
                  {String(
                    index + 1
                  ).padStart(2, '0')}
                </span>

                <div>
                  <strong>
                    {recommendation}
                  </strong>

                  <p>
                    Recommended by AI based on
                    your resume.
                  </p>
                </div>

                <span className="move-pill">
                  AI guided
                </span>
              </div>
            )
          )}
        </div>
      </section>
    </section>
  );
}

function InsightsPage({
  onBack,
  aiAnalysis,
}) {
  return (
    <section className="report-page">
      <div className="report-header">
        <div>
          <button
            className="text-button"
            type="button"
            onClick={onBack}
          >
            ← Back to Overview
          </button>

          <p className="eyebrow">
            AI INSIGHT
          </p>

          <h1>
            You’re closer than{' '}
            <em>you think.</em>
          </h1>

          <p className="muted">
            Here's what Hirely thinks makes
            your resume stand out.
          </p>
        </div>
      </div>

      <section className="report-grid">
        <article className="report-card">
          <p className="eyebrow">
            01 · STRONGEST SIGNAL
          </p>

          <h2>
            {aiAnalysis?.strengths?.[0] ||
              'AI analysis pending'}
          </h2>

          <p className="muted">
            Hirely identified this as one of
            the strongest signals in your
            resume.
          </p>

          <div className="insight-highlight">
            <strong>
              Why it matters
            </strong>

            <p>
              Strong evidence in this area can
              improve how well your resume
              matches relevant roles.
            </p>
          </div>
        </article>

        <article className="report-card">
          <p className="eyebrow">
            02 · STRONGEST SIGNAL
          </p>

          <h2>
            {aiAnalysis?.strengths?.[1] ||
              'AI analysis pending'}
          </h2>

          <p className="muted">
            This is another area where your
            resume shows useful evidence.
          </p>

          <div className="insight-highlight">
            <strong>
              Why it matters
            </strong>

            <p>
              Highlighting this strength clearly
              can make your resume more convincing
              to recruiters.
            </p>
          </div>
        </article>
      </section>

      <section className="report-card">
        <p className="eyebrow">
          WHAT TO IMPROVE
        </p>

        <h2>
          Turn good evidence into great evidence.
        </h2>

        <div className="report-list">
          {aiAnalysis?.skillGaps?.map(
            (gap, index) => (
              <div key={index}>
                <span>→</span>

                <div>
                  <strong>{gap}</strong>

                  <p>
                    Identified by AI as an area
                    that could improve your
                    resume.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </section>
  );
}

function RecommendationsPage({
  onBack,
  aiAnalysis,
}) {
  const [
    activeRecommendation,
    setActiveRecommendation,
  ] = useState(null);

  return (
    <section className="report-page">
      <div className="report-header">
        <div>
          <button
            className="text-button"
            type="button"
            onClick={onBack}
          >
            ← Back to Overview
          </button>

          <p className="eyebrow">
            AI RECOMMENDATIONS
          </p>

          <h1>
            Your next{' '}
            <em>growth moves.</em>
          </h1>

          <p className="muted">
            Focus on these skills to make your
            profile stronger for your target
            product roles.
          </p>
        </div>
      </div>

      <section className="recommendation-list">
        {aiAnalysis?.recommendations?.map(
          (
            recommendation,
            index
          ) => (
            <article
              className="recommendation-card"
              key={index}
            >
              <div className="recommendation-number">
                {String(
                  index + 1
                ).padStart(2, '0')}
              </div>

              <div className="recommendation-content">
                <div className="recommendation-top">
                  <div>
                    <p className="eyebrow">
                      AI RECOMMENDATION
                    </p>

                    <h2>
                      {recommendation}
                    </h2>
                  </div>

                  <span className="move-pill">
                    AI guided
                  </span>
                </div>

                <p className="muted">
                  Hirely recommends this based
                  on your resume analysis.
                </p>

                <div className="recommendation-action">
                  <strong>
                    Recommended action
                  </strong>

                  <span>
                    Focus on this improvement to
                    strengthen your resume and
                    career profile.
                  </span>
                </div>

                <button
                  className="text-button"
                  type="button"
                  onClick={() =>
                    setActiveRecommendation(
                      index
                    )
                  }
                >
                  {activeRecommendation ===
                  index
                    ? 'Currently working on this'
                    : 'Start working →'}
                </button>
              </div>
            </article>
          )
        )}
      </section>
    </section>
  );
}

function CoachingPlanPage({
  onBack,
  aiAnalysis,
}) {
  const [completed, setCompleted] =
    useState([]);

  const recommendations =
    aiAnalysis?.recommendations || [];

  const toggleComplete = (id) => {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  };

  const progress =
    recommendations.length > 0
      ? Math.round(
          (completed.length /
            recommendations.length) *
            100
        )
      : 0;

  return (
    <section className="report-page coaching-page">
      <div className="report-header">
        <div>
          <button
            className="text-button"
            type="button"
            onClick={onBack}
          >
            ← Back to Overview
          </button>

          <p className="eyebrow">
            AI COACHING PLAN
          </p>

          <h1>
            Your next{' '}
            <em>best moves.</em>
          </h1>

          <p className="muted">
            A practical action plan designed to
            move your resume closer to your target
            role.
          </p>
        </div>
      </div>

      <section className="coaching-progress">
        <div>
          <p className="eyebrow">
            YOUR PROGRESS
          </p>

          <div className="progress-title">
            <h2>
              {completed.length} of{' '}
              {recommendations.length}{' '}
              completed
            </h2>

            <strong>
              {progress}%
            </strong>
          </div>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="muted">
          Complete these actions to strengthen
          your profile.
        </p>
      </section>

      <section className="coaching-list">
        {recommendations.length ? (
          recommendations.map(
            (
              recommendation,
              index
            ) => {
              const isComplete =
                completed.includes(index);

              return (
                <article
                  className={`coaching-card ${
                    isComplete
                      ? 'completed'
                      : ''
                  }`}
                  key={index}
                >
                  <div className="coaching-number">
                    {isComplete
                      ? '✓'
                      : String(
                          index + 1
                        ).padStart(2, '0')}
                  </div>

                  <div className="coaching-content">
                    <div className="coaching-card-top">
                      <div>
                        <p className="eyebrow">
                          AI COACHING MOVE
                        </p>

                        <h2>
                          {recommendation}
                        </h2>
                      </div>

                      <span className="coaching-time">
                        AI guided
                      </span>
                    </div>

                    <p className="muted">
                      This action was generated
                      from your resume analysis.
                    </p>

                    <div className="coaching-reason">
                      <strong>
                        Why this matters
                      </strong>

                      <span>
                        Completing this recommendation
                        can strengthen your resume and
                        career profile.
                      </span>
                    </div>

                    <button
                      className={`coaching-complete ${
                        isComplete
                          ? 'done'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        toggleComplete(
                          index
                        )
                      }
                    >
                      {isComplete
                        ? 'Completed ✓'
                        : 'Mark as complete'}
                    </button>
                  </div>
                </article>
              );
            }
          )
        ) : (
          <article className="coaching-card">
            <div className="coaching-content">
              <p className="eyebrow">
                AI COACHING
              </p>

              <h2>
                Run your resume analysis first
              </h2>

              <p className="muted">
                Your personalized coaching plan
                will appear here after Hirely
                analyzes your resume.
              </p>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}

function Overview({
  file,
  setFile,
  description,
  setDescription,
  targetRole,
  setTargetRole,
  status,
  runAnalysis,
  analyzeResume,
  aiAnalysis,
  notify,
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  setNotifications,
  unreadCount,
  markAllNotificationsRead,
  onViewReport,
  onViewInsights,
  onViewRecommendations,
  onViewCoaching,
  onRerunAnalysis,
  onRemoveAnalysis,
}) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">
            THURSDAY, AUGUST 27
          </p>

          <h1>
            Your career,{' '}
            <em>made clearer.</em>
          </h1>
        </div>

        <div className="notification-wrapper">
          <button
            className="icon-button"
            type="button"
            aria-label="Notifications"
            aria-expanded={
              notificationsOpen
            }
            onClick={() =>
              setNotificationsOpen(
                (current) => !current
              )
            }
          >
            ♧

            {unreadCount > 0 && (
              <i className="notification-dot" />
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-header">
                <div>
                  <strong>
                    Notifications
                  </strong>

                  {unreadCount > 0 && (
                    <span>
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={
                      markAllNotificationsRead
                    }
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length ===
                0 ? (
                  <div className="notification-empty">
                    <span>✓</span>

                    <strong>
                      You're all caught up.
                    </strong>

                    <p>
                      No new notifications.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        className={`notification-item ${
                          notification.unread
                            ? 'unread'
                            : ''
                        }`}
                        type="button"
                        key={
                          notification.id
                        }
                        onClick={() => {
                          setNotifications(
                            (current) =>
                              current.map(
                                (item) =>
                                  item.id ===
                                  notification.id
                                    ? {
                                        ...item,
                                        unread:
                                          false,
                                      }
                                    : item
                              )
                          );
                        }}
                      >
                        <span className="notification-icon">
                          ✦
                        </span>

                        <span className="notification-copy">
                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          <small>
                            {
                              notification.text
                            }
                          </small>
                        </span>

                        {notification.unread && (
                          <span className="notification-unread" />
                        )}
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="hero-card">
        <div className="hero-copy">
          <span className="pill">
            ✦ AI RESUME REVIEW
          </span>

          <h2>
            Find your next{' '}
            <span>best fit.</span>
          </h2>

          <p>
            Upload a resume and job description.
            Hirely turns them into a precise
            action plan in seconds.
          </p>
        </div>

        <UploadPanel
          file={file}
          onFile={(nextFile) => {
            setFile(nextFile);

            notify(
              'Resume added — add a job description for the sharpest insights.'
            );
          }}
        />

        <div className="job-input">
          <label htmlFor="target-role">
            TARGET ROLE
          </label>

          <input
            id="target-role"
            type="text"
            value={targetRole}
            onChange={(event) =>
              setTargetRole(
                event.target.value
              )
            }
            placeholder="e.g. Software Engineer"
          />

          <label htmlFor="job-description">
            TARGET JOB DESCRIPTION{' '}
            <span>
              OPTIONAL, BUT RECOMMENDED
            </span>
          </label>

          <textarea
            id="job-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Paste a job description to unlock a tailored match analysis…"
          />

          <div className="input-footer">
            <small>
              Hirely’s AI never shares your data.
            </small>

            <button
              className="analyze-btn"
              type="button"
              onClick={async () => {
                const extractedText =
                  await runAnalysis();

                if (extractedText) {
                  await analyzeResume(
                    extractedText
                  );
                }
              }}
              disabled={
                status === 'loading'
              }
            >
              {status === 'loading'
                ? 'Analyzing your fit…'
                : status === 'complete'
                  ? 'Analysis complete ✓'
                  : (
                    <>
                      Analyze with AI{' '}
                      <b>→</b>
                    </>
                  )}
            </button>
          </div>
        </div>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">
            YOUR LATEST REVIEW
          </p>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={onViewReport}
        >
          View full report →
        </button>
      </section>

      <section className="results-grid">
        <ScoreCard
          onViewReport={
            onViewReport
          }
          onRerunAnalysis={
            onRerunAnalysis
          }
          onRemoveAnalysis={
            onRemoveAnalysis
          }
        />

        <article className="insight-card">
          <div className="card-icon mint">
            ✦
          </div>

          <div>
            <p className="eyebrow">
              AI INSIGHT
            </p>

            <h3>
              You’re closer than
              <br />
              you think.
            </h3>

            <p className="muted">
              Your product thinking and design
              system experience are a standout.
            </p>

            <button
              className="text-button"
              type="button"
              onClick={
                onViewInsights
              }
            >
              See what stands out →
            </button>
          </div>
        </article>

        <article className="gaps-card">
          <div className="card-icon peach">
            ↗
          </div>

          <p className="eyebrow">
            TOP OPPORTUNITY
          </p>

          <h3>
            Close 3 skill gaps
          </h3>

          <div className="tags">
            <span>
              Figma variables
            </span>

            <span>
              0→1 strategy
            </span>

            <span>
              Motion design
            </span>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={
              onViewRecommendations
            }
          >
            Get recommended →
          </button>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="activity">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">
                AI COACHING PLAN
              </p>

              <h2>
                Next best moves
              </h2>
            </div>

            <button
              className="text-button"
              type="button"
              onClick={
                onViewCoaching
              }
            >
              See all →
            </button>
          </div>

          {coachingMoves.map(
            ([
              number,
              title,
              copy,
              tag,
            ]) => (
              <div
                className="move"
                key={number}
              >
                <span className="move-no">
                  {number}
                </span>

                <div>
                  <strong>
                    {title}
                  </strong>

                  <p>{copy}</p>
                </div>

                <span className="move-pill">
                  {tag}
                </span>
              </div>
            )
          )}
        </article>

        <article className="trend">
          <p className="eyebrow">
            MARKET READINESS
          </p>

          <div className="trend-title">
            <h2>
              On the rise
            </h2>

            <span className="up">
              ↗ 12%
            </span>
          </div>

          <p className="muted">
            Your profile is trending above
            similar candidates applying to
            product roles.
          </p>

          <div
            className="bars"
            aria-label="Market readiness increased from March to August"
          >
            <i
              style={{
                height: '32%',
              }}
            />

            <i
              style={{
                height: '48%',
              }}
            />

            <i
              style={{
                height: '41%',
              }}
            />

            <i
              style={{
                height: '62%',
              }}
            />

            <i
              style={{
                height: '57%',
              }}
            />

            <i
              style={{
                height: '76%',
              }}
            />

            <i
              className="last"
              style={{
                height: '92%',
              }}
            />
          </div>

          <div className="bar-labels">
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </article>
      </section>
    </>
  );
}

function Analyses({
  onViewReport,
  onNewAnalysis,
  analysisHistory,
}) {
  return (
    <section className="analyses-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            ANALYSES
          </p>

          <h1>
            Your analyses
          </h1>

          <p className="muted">
            Review your previous resume
            analyses and track your progress.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onNewAnalysis}
        >
          + New analysis
        </button>
      </div>

      <div className="analysis-list">
        {analysisHistory?.length >
        0 ? (
          analysisHistory.map(
            (analysis) => {
              const score =
                analysis.overallScore ||
                0;

              const status =
                score >= 80
                  ? 'Strong match'
                  : score >= 70
                    ? 'Good match'
                    : 'Needs improvement';

              const date =
                analysis.createdAt
                  ? new Date(
                      analysis.createdAt
                    ).toLocaleDateString()
                  : 'Unknown date';

              return (
                <article
                  className="analysis-row"
                  key={analysis._id}
                >
                  <div className="analysis-main">
                    <div className="analysis-icon">
                      CV
                    </div>

                    <div>
                      <strong>
                        {analysis.candidateName
                          ? `${analysis.candidateName}'s Resume`
                          : 'Resume Analysis'}
                      </strong>

                      <small>
                        {analysis.targetRole ||
                          'Current target role'}{' '}
                        · {date}
                      </small>
                    </div>
                  </div>

                  <div className="analysis-score">
                    <strong>
                      {score}
                    </strong>

                    <span>
                      /100
                    </span>
                  </div>

                  <div className="analysis-status">
                    <strong>
                      {status}
                    </strong>

                    <small>
                      Saved AI analysis
                    </small>
                  </div>

                  <button
                    type="button"
                    className="analysis-view"
                    onClick={() =>
                      onViewReport(
                        analysis
                      )
                    }
                  >
                    View
                    <span>→</span>
                  </button>
                </article>
              );
            }
          )
        ) : (
          <div className="analysis-empty">
            <strong>
              No analyses yet
            </strong>

            <p>
              Upload a resume and run an AI
              analysis to see it here.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onNewAnalysis}
            >
              Start your first analysis
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function TargetRoles({
  onAnalyzeRole,
  onNewRole,
}) {
  const roles = [
    {
      id: 1,
      title: 'Frontend Developer',
      companyType:
        'Product & SaaS',
      score: 82,
      skills:
        'React · JavaScript · CSS',
    },
    {
      id: 2,
      title: 'React Developer',
      companyType:
        'Web & Software',
      score: 76,
      skills:
        'React · JavaScript · REST APIs',
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      companyType:
        'Technology',
      score: 69,
      skills:
        'React · Node.js · MongoDB',
    },
  ];

  return (
    <section className="roles-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            TARGET ROLES
          </p>

          <h1>
            Your target roles
          </h1>

          <p className="muted">
            Roles you are preparing your resume
            and skills for.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onNewRole}
        >
          + Add role
        </button>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <article
            className="role-card"
            key={role.id}
          >
            <div className="role-card-top">
              <div className="role-icon">
                {role.title
                  .split(' ')
                  .map(
                    (word) =>
                      word[0]
                  )
                  .join('')
                  .slice(0, 2)}
              </div>

              <span className="role-score">
                {role.score}/100
              </span>
            </div>

            <div className="role-info">
              <h2>
                {role.title}
              </h2>

              <p>
                {role.companyType}
              </p>

              <small>
                {role.skills}
              </small>
            </div>

            <div className="role-card-bottom">
              <span>
                {role.score >= 80
                  ? 'Strong match'
                  : role.score >= 70
                    ? 'Good match'
                    : 'Needs improvement'}
              </span>

              <button
                type="button"
                onClick={() =>
                  onAnalyzeRole(
                    role.title
                  )
                }
              >
                Analyze
                <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Settings({
  user,
  onSignIn,
  onSignOut,
}) {
  const [
    profileName,
    setProfileName,
  ] = useState(
    user?.name || 'Zaid Khan'
  );

  const editProfile = () => {
    const name =
      window.prompt(
        'Enter your name',
        profileName
      );

    if (name?.trim()) {
      setProfileName(
        name.trim()
      );
    }
  };

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            SETTINGS
          </p>

          <h1>
            Settings
          </h1>

          <p className="muted">
            Manage your profile, plan, and
            Hirely preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <article className="settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>Profile</h2>

              <p>
                Your basic Hirely profile
                information.
              </p>
            </div>
          </div>

          {user ? (
            <div className="profile-settings">
              <div className="settings-avatar">
                {profileName
                  .split(' ')
                  .map(
                    (word) =>
                      word[0]
                  )
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="settings-profile-info">
                <strong>
                  {profileName}
                </strong>

                <span>
                  {user.email}
                </span>

                <small>
                  Free plan
                </small>
              </div>

              <button
                type="button"
                className="settings-action"
                onClick={
                  editProfile
                }
              >
                Edit profile
              </button>
            </div>
          ) : (
            <div className="profile-settings">
              <div className="settings-avatar">
                ?
              </div>

              <div className="settings-profile-info">
                <strong>
                  Not signed in
                </strong>

                <span>
                  Sign in to manage your
                  Hirely account.
                </span>
              </div>

              <button
                type="button"
                className="settings-action"
                onClick={
                  onSignIn
                }
              >
                Sign in
              </button>
            </div>
          )}
        </article>

        <article className="settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>Plan</h2>

              <p>
                Your current Hirely
                subscription.
              </p>
            </div>

            <span className="plan-badge">
              FREE
            </span>
          </div>

          <div className="plan-info">
            <strong>
              Free plan
            </strong>

            <p>
              Basic resume analysis and career
              insights for getting started.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              alert(
                'Premium plans will be available soon.'
              )
            }
          >
            Upgrade plan
          </button>
        </article>

        <article className="settings-card settings-preferences">
          <div className="settings-card-heading">
            <div>
              <h2>
                Preferences
              </h2>

              <p>
                Control how Hirely works for you.
              </p>
            </div>
          </div>

          <label className="setting-option">
            <div>
              <strong>
                Resume improvement tips
              </strong>

              <small>
                Show suggestions after every
                resume analysis.
              </small>
            </div>

            <input
              type="checkbox"
              defaultChecked
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>
                Career insights
              </strong>

              <small>
                Receive recommendations based
                on your target roles.
              </small>
            </div>

            <input
              type="checkbox"
              defaultChecked
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>
                Product updates
              </strong>

              <small>
                Receive occasional updates about
                new Hirely features.
              </small>
            </div>

            <input type="checkbox" />
          </label>
        </article>

        {user && (
          <article className="settings-card">
            <div className="settings-card-heading">
              <div>
                <h2>
                  Account
                </h2>

                <p>
                  Manage your Hirely account
                  session.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="settings-action"
              onClick={
                onSignOut
              }
            >
              Sign out
            </button>
          </article>
        )}
      </div>
    </section>
  );
}

function AuthPanel({
  onAuthSuccess,
  onCancel,
}) {
  const [mode, setMode] =
    useState('login');

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const submitAuth = async (
    event
  ) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const endpoint =
        mode === 'login'
          ? '/api/auth/login'
          : '/api/auth/signup';

      const body =
        mode === 'login'
          ? {
              email,
              password,
            }
          : {
              name,
              email,
              password,
            };

      const response =
        await fetch(
          `http://localhost:5001${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              body
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Authentication failed.'
        );
      }

      onAuthSuccess(data);
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            ACCOUNT
          </p>

          <h1>
            {mode === 'login'
              ? 'Welcome back'
              : 'Create your account'}
          </h1>

          <p className="muted">
            {mode === 'login'
              ? 'Sign in to continue using Hirely.'
              : 'Create your Hirely account to save your work.'}
          </p>
        </div>
      </div>

      <article className="settings-card auth-card">
        <form onSubmit={submitAuth}>
          {mode === 'signup' && (
            <label className="auth-field">
              <span>
                Name
              </span>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Your password"
              required
            />
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </span>

          <button
            type="button"
            className="settings-action"
            onClick={() => {
              setError('');

              setMode(
                mode === 'login'
                  ? 'signup'
                  : 'login'
              );
            }}
          >
            {mode === 'login'
              ? 'Create account'
              : 'Sign in'}
          </button>

          <button
            type="button"
            className="settings-action"
            onClick={
              onCancel
            }
          >
            Cancel
          </button>
        </div>
      </article>
    </section>
  );
}

export default function App() {
  const [file, setFile] =
    useState(null);

  const [description, setDescription] =
    useState('');

  const [targetRole, setTargetRole] =
    useState('Product Designer');

  const [user, setUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem(
          'hirelyUser'
        );

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    });

  const [token, setToken] =
    useState(() => {
      return (
        localStorage.getItem(
          'hirelyToken'
        ) || ''
      );
    });

  const [
    analysisHistory,
    setAnalysisHistory,
  ] = useState([]);

  const [status, setStatus] =
    useState('idle');

  const [resumeText, setResumeText] =
    useState('');

  const [aiAnalysis, setAiAnalysis] =
    useState(null);

  const [toast, setToast] =
    useState('');

  const [activePage, setActivePage] =
    useState('overview');

  useEffect(() => {
    if (
      !token ||
      activePage !== 'analyses'
    ) {
      return;
    }

    const loadAnalyses =
      async () => {
        try {
          const response =
            await fetch(
              'http://localhost:5001/api/analyses',
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                'Failed to load analyses.'
            );
          }

          setAnalysisHistory(
            data.analyses || []
          );

          console.log(
            'Analysis history:',
            data.analyses
          );
        } catch (error) {
          console.error(
            'Load analyses error:',
            error
          );
        }
      };

    loadAnalyses();
  }, [token, activePage]);

  const [showReport, setShowReport] =
    useState(false);

  const [showInsights, setShowInsights] =
    useState(false);

  const [
    showRecommendations,
    setShowRecommendations,
  ] = useState(false);

  const [showCoaching, setShowCoaching] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([
    {
      id: 1,
      title: 'Resume analysis ready',
      text: 'Your latest resume scored 82/100.',
      unread: true,
    },
    {
      id: 2,
      title: 'New coaching move',
      text: 'Quantify your product impact.',
      unread: true,
    },
    {
      id: 3,
      title: 'Profile trending',
      text: 'Your market readiness is up 12%.',
      unread: false,
    },
  ]);

  const notify = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleAuthSuccess = (
    data
  ) => {
    setToken(data.token);
    setUser(data.user);

    localStorage.setItem(
      'hirelyToken',
      data.token
    );

    localStorage.setItem(
      'hirelyUser',
      JSON.stringify(
        data.user
      )
    );

    setActivePage(
      'settings'
    );

    notify(
      `Welcome, ${data.user.name}.`
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem(
      'hirelyToken'
    );

    localStorage.removeItem(
      'hirelyUser'
    );

    setToken('');
    setUser(null);

    setAnalysisHistory([]);
    setAiAnalysis(null);

    setActivePage(
      'settings'
    );

    notify(
      'Signed out successfully.'
    );
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length;

  const markAllNotificationsRead =
    () => {
      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              unread: false,
            })
          )
      );

      notify(
        'All notifications marked as read.'
      );
    };

  const runAnalysis = async () => {
    if (!file) {
      return notify(
        'Add a resume first to start your AI review.'
      );
    }

    setStatus('loading');

    try {
      const formData =
        new FormData();

      formData.append(
        'resume',
        file
      );

      const response =
        await fetch(
          'http://localhost:5001/api/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Upload failed'
        );
      }

      console.log(
        'Backend response:',
        data
      );

      setResumeText(
        data.text
      );

      console.log(
        'Resume text stored:',
        data.text
      );

      setStatus('complete');

      notify(
        'Resume uploaded successfully.'
      );

      return data.text;
    } catch (error) {
      console.error(
        'Upload error:',
        error
      );

      setStatus('idle');

      notify(
        'Could not upload your resume.'
      );

      return null;
    }
  };

  const analyzeResume =
    async (text) => {
      if (!text) {
        return notify(
          'Upload your resume first.'
        );
      }

      try {
        const response =
          await fetch(
            'http://localhost:5001/api/analyze',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                resumeText: text,
                targetRole,
                jobDescription:
                  description,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'AI analysis failed'
          );
        }

        console.log(
          'AI Analysis:',
          data.analysis
        );

        const parsedAnalysis =
          typeof data.analysis ===
          'string'
            ? JSON.parse(
                data.analysis
              )
            : data.analysis;

        const latestAnalysis = {
          ...parsedAnalysis,
          targetRole,
        };

        setAiAnalysis(
          latestAnalysis
        );

        if (
          latestAnalysis._id
        ) {
          setAnalysisHistory(
            (current) => [
              latestAnalysis,
              ...current.filter(
                (item) =>
                  item._id !==
                  latestAnalysis._id
              ),
            ]
          );
        }

        notify(
          'AI analysis completed.'
        );
      } catch (error) {
        console.error(
          'AI analysis error:',
          error
        );

        notify(
          'Could not analyze your resume.'
        );
      }
    };

  const navigate = (page) => {
    setActivePage(page);

    setShowReport(false);
    setShowInsights(false);
    setShowRecommendations(
      false
    );
    setShowCoaching(false);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          type="button"
          onClick={() =>
            navigate('overview')
          }
        >
          <span className="brand-mark">
            H
          </span>

          <span>
            hirely
          </span>
        </button>

        <nav aria-label="Main navigation">
          <button
            className={`nav-link ${
              activePage ===
              'overview'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              navigate('overview')
            }
          >
            <span>▦</span>
            Overview
          </button>

          <button
            className={`nav-link ${
              activePage ===
              'analyses'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              navigate('analyses')
            }
          >
            <span>✦</span>
            Analyses
          </button>

          <button
            className={`nav-link ${
              activePage ===
              'targetRoles'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              navigate(
                'targetRoles'
              )
            }
          >
            <span>⌘</span>
            Target roles
          </button>

          <button
            className={`nav-link ${
              activePage ===
              'settings'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              navigate(
                'settings'
              )
            }
          >
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <section className="sidebar-card">
          <div className="sparkle">
            ✦
          </div>

          <h3>
            Powered by AI
          </h3>

          <p>
            Each review is tailored to the
            role, market, and your unique story.
          </p>
        </section>

        <div className="profile">
          <div className="avatar">
            {user
              ? user.name
                  .split(' ')
                  .map(
                    (word) =>
                      word[0]
                  )
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : '?'}
          </div>

          <div>
            <strong>
              {user?.name ||
                'Not signed in'}
            </strong>

            <small>
              Free plan
            </small>
          </div>

          <button
            className="dots"
            type="button"
            onClick={() =>
              notify(
                'Profile menu opened.'
              )
            }
          >
            •••
          </button>
        </div>
      </aside>

      <section className="workspace">
        {activePage ===
          'overview' &&
          !showReport &&
          !showInsights &&
          !showRecommendations &&
          !showCoaching && (
            <Overview
              file={file}
              setFile={
                setFile
              }
              description={
                description
              }
              setDescription={
                setDescription
              }
              targetRole={
                targetRole
              }
              setTargetRole={
                setTargetRole
              }
              status={status}
              runAnalysis={
                runAnalysis
              }
              aiAnalysis={
                aiAnalysis
              }
              analyzeResume={
                analyzeResume
              }
              notify={notify}
              notificationsOpen={
                notificationsOpen
              }
              setNotificationsOpen={
                setNotificationsOpen
              }
              notifications={
                notifications
              }
              setNotifications={
                setNotifications
              }
              unreadCount={
                unreadCount
              }
              markAllNotificationsRead={
                markAllNotificationsRead
              }
              onViewReport={() =>
                setShowReport(
                  true
                )
              }
              onViewInsights={() =>
                setShowInsights(
                  true
                )
              }
              onViewRecommendations={() =>
                setShowRecommendations(
                  true
                )
              }
              onViewCoaching={() =>
                setShowCoaching(
                  true
                )
              }
              onRerunAnalysis={() => {
                setShowReport(
                  false
                );

                setActivePage(
                  'overview'
                );
              }}
              onRemoveAnalysis={() => {
                setAiAnalysis(
                  null
                );

                setShowReport(
                  false
                );

                setActivePage(
                  'overview'
                );

                notify(
                  'Analysis removed.'
                );
              }}
            />
          )}

        {activePage ===
          'overview' &&
          showReport && (
            <FullReport
              onBack={() =>
                setShowReport(
                  false
                )
              }
              aiAnalysis={
                aiAnalysis
              }
              targetRole={
                targetRole
              }
            />
          )}

        {activePage ===
          'overview' &&
          showInsights && (
            <InsightsPage
              onBack={() =>
                setShowInsights(
                  false
                )
              }
              aiAnalysis={
                aiAnalysis
              }
            />
          )}

        {activePage ===
          'overview' &&
          showRecommendations && (
            <RecommendationsPage
              onBack={() =>
                setShowRecommendations(
                  false
                )
              }
              aiAnalysis={
                aiAnalysis
              }
            />
          )}

        {activePage ===
          'overview' &&
          showCoaching && (
            <CoachingPlanPage
              onBack={() =>
                setShowCoaching(
                  false
                )
              }
              aiAnalysis={
                aiAnalysis
              }
            />
          )}

        {activePage ===
          'analyses' && (
          <Analyses
            analysisHistory={
              analysisHistory
            }

            onViewReport={(
              analysis
            ) => {
              setAiAnalysis({
                ...analysis,
                targetRole:
                  analysis.targetRole ||
                  '',
              });

              setTargetRole(
                analysis.targetRole ||
                  ''
              );

              setActivePage(
                'overview'
              );

              setShowReport(
                true
              );
            }}

            onNewAnalysis={() => {
              setActivePage(
                'overview'
              );

              setShowReport(
                false
              );

              setShowInsights(
                false
              );

              setShowRecommendations(
                false
              );

              setShowCoaching(
                false
              );
            }}
          />
        )}

        {activePage ===
          'targetRoles' && (
          <TargetRoles
            onNewRole={() => {
              const role =
                window.prompt(
                  'Enter a target role'
                );

              if (role?.trim()) {
                setTargetRole(
                  role.trim()
                );

                setActivePage(
                  'overview'
                );

                notify(
                  `Target role set to ${role.trim()}.`
                );
              }
            }}
            onAnalyzeRole={(
              role
            ) => {
              setTargetRole(
                role
              );

              setActivePage(
                'overview'
              );

              setShowReport(
                false
              );

              notify(
                `Target role set to ${role}. Upload your resume to analyze it.`
              );
            }}
          />
        )}

        {activePage ===
          'settings' && (
          <Settings
            user={user}
            onSignIn={() =>
              setActivePage(
                'auth'
              )
            }
            onSignOut={
              handleSignOut
            }
          />
        )}

        {activePage ===
          'auth' && (
          <AuthPanel
            onAuthSuccess={
              handleAuthSuccess
            }
            onCancel={() =>
              setActivePage(
                'settings'
              )
            }
          />
        )}
      </section>

      <div
        className={`toast ${
          toast ? 'show' : ''
        }`}
        role="status"
      >
        {toast}
      </div>
    </main>
  );
}
