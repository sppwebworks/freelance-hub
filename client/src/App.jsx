import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "./features/auth/authSlice";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetail from "./pages/JobDetail";
import JobApplications from "./pages/JobApplications";
import Saved from "./pages/Saved";
import Applications from "./pages/Applications";
import PostJob from "./pages/PostJob";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MyJobs from "./pages/MyJobs";

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(loadUser());
  }, [dispatch, token, user]);

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/jobs/:jobId/applications"
            element={
              <PrivateRoute>
                <JobApplications />
              </PrivateRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <PrivateRoute>
                <Saved />
              </PrivateRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <Applications />
              </PrivateRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <PrivateRoute>
                <PostJob />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <PrivateRoute>
                <MyJobs />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
