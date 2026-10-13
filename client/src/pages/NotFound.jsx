import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="empty-state">
    <div className="empty-emoji">404</div>
    <h2>Page not found</h2>
    <Link to="/" className="btn-primary">
      Back to Jobs
    </Link>
  </div>
);

export default NotFound;
