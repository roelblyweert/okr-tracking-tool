import { Fragment } from 'react';
import type { ObjectiveWithKeyResults } from '../types';
import {
  compareMonths,
  enumerateMonths,
  formatMonthLabel,
  monthDiff,
  monthIndex,
} from '../lib/dates';
import { keyResultProgress, objectiveProgress } from '../progress';

interface Props {
  objectives: ObjectiveWithKeyResults[];
}

export default function RoadmapView({ objectives }: Props) {
  if (objectives.length === 0) {
    return (
      <p className="muted">
        No objectives yet. Add some in the List view to see them here.
      </p>
    );
  }

  // Timeline bounds across every objective: earliest start, latest end.
  let timelineStart = objectives[0].starts_on;
  let timelineEnd = objectives[0].ends_on;
  for (const obj of objectives) {
    if (compareMonths(obj.starts_on, timelineStart) < 0) {
      timelineStart = obj.starts_on;
    }
    if (compareMonths(obj.ends_on, timelineEnd) > 0) {
      timelineEnd = obj.ends_on;
    }
  }

  const months = enumerateMonths(timelineStart, timelineEnd);
  const colCount = months.length;

  // One template reused by every row so the label column and month columns line
  // up. (repeat(var(--x), …) is unreliable, so colCount is interpolated here.)
  const gridTemplateColumns = `var(--rm-label-col) repeat(${colCount}, var(--rm-month-col))`;

  return (
    <div className="roadmap-scroll">
      <div className="roadmap">
        <div className="rm-row rm-head" style={{ gridTemplateColumns }}>
          <div className="rm-label rm-corner">Timeline</div>
          {months.map((m) => (
            <div key={m} className="rm-month">
              {formatMonthLabel(m)}
            </div>
          ))}
        </div>

        {objectives.map((obj) => {
          const oStart = monthIndex(timelineStart, obj.starts_on);
          const oSpan = monthDiff(obj.starts_on, obj.ends_on) + 1;
          return (
            <Fragment key={obj.id}>
              <div className="rm-row rm-objective-row" style={{ gridTemplateColumns }}>
                <div className="rm-label">{obj.title}</div>
                {months.map((m) => (
                  <div key={m} className="rm-cell" />
                ))}
                <div
                  className="rm-bar rm-bar--objective"
                  style={{ gridColumn: `${oStart + 2} / span ${oSpan}`, gridRow: 1 }}
                  title={obj.title}
                >
                  <div
                    className="rm-bar-fill"
                    style={{ width: `${objectiveProgress(obj)}%` }}
                  />
                  <span className="rm-bar-label">{objectiveProgress(obj)}%</span>
                </div>
              </div>

              {obj.key_results.map((kr) => {
                const kStart = monthIndex(timelineStart, kr.starts_on);
                const kSpan = monthDiff(kr.starts_on, kr.ends_on) + 1;
                return (
                  <div className="rm-row rm-kr-row" style={{ gridTemplateColumns }} key={kr.id}>
                    <div className="rm-label rm-label--kr">{kr.title}</div>
                    {months.map((m) => (
                      <div key={m} className="rm-cell" />
                    ))}
                    <div
                      className="rm-bar rm-bar--kr"
                      style={{ gridColumn: `${kStart + 2} / span ${kSpan}`, gridRow: 1 }}
                      title={kr.title}
                    >
                      <div
                        className="rm-bar-fill"
                        style={{ width: `${keyResultProgress(kr)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
