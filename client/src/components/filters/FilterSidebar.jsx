import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategory,
  toggleSkill,
  setBudget,
  setExperienceLevel,
  toggleRemote,
  resetFilters,
} from "../../features/filters/filtersSlice";
import { fetchFilterCounts } from "../../features/jobs/jobsSlice";

const CATEGORIES = ["development", "design", "marketing", "writing", "other"];
const EXPERIENCE = ["entry", "intermediate", "expert"];
const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "MongoDB",
  "Figma",
  "Python",
  "SEO",
  "AWS",
  "TypeScript",
];

const FilterSidebar = ({ onClose }) => {
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.filters);
  const counts = useSelector((s) => s.jobs.counts);

  useEffect(() => {
    dispatch(fetchFilterCounts());
  }, [dispatch]);

  return (
    <aside className={`filter-sidebar ${filters.sidebarOpen ? "open" : ""}`}>
      <div className="filter-header">
        <h3>Filters</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="icon-btn-sm"
            onClick={() => dispatch(resetFilters())}
            title="Reset"
          >
            ↺
          </button>
          {onClose && (
            <button className="icon-btn-sm" onClick={onClose} title="Close">
              ✕
            </button>
          )}
        </div>
      </div>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={filters.isRemote}
          onChange={() => dispatch(toggleRemote())}
        />
        <span>🌍 Remote only</span>
        {counts?.remote != null && (
          <span className="filter-count">{counts.remote}</span>
        )}
      </label>

      <div className="filter-group">
        <h4>Category</h4>
        <button
          className={`filter-option ${!filters.category ? "active" : ""}`}
          onClick={() => dispatch(setCategory(""))}
        >
          All <span className="filter-count">{counts?.total ?? ""}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-option ${filters.category === c ? "active" : ""}`}
            onClick={() => dispatch(setCategory(c))}
          >
            <span style={{ textTransform: "capitalize" }}>{c}</span>
            {counts?.categories?.[c] != null && (
              <span className="filter-count">{counts.categories[c]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <h4>Experience</h4>
        {EXPERIENCE.map((e) => (
          <button
            key={e}
            className={`filter-option ${filters.experienceLevel === e ? "active" : ""}`}
            onClick={() =>
              dispatch(
                setExperienceLevel(filters.experienceLevel === e ? "" : e),
              )
            }
          >
            <span style={{ textTransform: "capitalize" }}>{e}</span>
            {counts?.experience?.[e] != null && (
              <span className="filter-count">{counts.experience[e]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <h4>Skills</h4>
        <div className="skills-list">
          {POPULAR_SKILLS.map((s) => (
            <button
              key={s}
              className={`skill-chip ${filters.skills.includes(s) ? "active" : ""}`}
              onClick={() => dispatch(toggleSkill(s))}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Budget (USD)</h4>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.budgetMin || ""}
            onChange={(e) =>
              dispatch(
                setBudget({
                  min: Number(e.target.value) || 0,
                  max: filters.budgetMax,
                }),
              )
            }
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.budgetMax || ""}
            onChange={(e) =>
              dispatch(
                setBudget({
                  min: filters.budgetMin,
                  max: Number(e.target.value) || 0,
                }),
              )
            }
            className="filter-input"
          />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
