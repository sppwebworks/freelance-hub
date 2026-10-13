import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearch,
  setSortBy,
  toggleSidebar,
} from "../../features/filters/filtersSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const search = useSelector((s) => s.filters.search);
  const sortBy = useSelector((s) => s.filters.sortBy);
  const [local, setLocal] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setSearch(local)), 400);
    return () => clearTimeout(t);
  }, [local, dispatch]);

  return (
    <div className="search-bar-row">
      <button
        className="icon-btn mobile-only"
        onClick={() => dispatch(toggleSidebar())}
      >
        ☰
      </button>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search jobs, skills, companies..."
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />
        {local && (
          <button className="clear-btn" onClick={() => setLocal("")}>
            ✕
          </button>
        )}
      </div>
      <select
        className="sort-select"
        value={sortBy}
        onChange={(e) => dispatch(setSortBy(e.target.value))}
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest</option>
        <option value="budget-high">Budget: High → Low</option>
        <option value="budget-low">Budget: Low → High</option>
      </select>
    </div>
  );
};

export default SearchBar;
