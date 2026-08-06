import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import ConditionalState from "@/components/ui/ConditionalState";

/**
 * Route guard: shows a loading spinner while the session restores and
 * redirects to /login when no user is signed in.
 */
function RequireAuth({ children }) {
  const { user, fetching } = useAuth();
  const location = useLocation();

  if (fetching) {
    return <ConditionalState loading />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default RequireAuth;