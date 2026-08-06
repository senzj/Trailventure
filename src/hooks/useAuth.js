import { useAtomValue } from "jotai";
import {
  authLoadingAtom,
  handleLogin,
  handleLogout,
  handleSignup,
  handleUpdateProfile,
  userAtom,
} from "../atom/auth";

/**
 * Central auth hook. Reads the global auth atom (shared across all components)
 * so login/logout reflect everywhere immediately.
 */
function useAuth() {
  const user = useAtomValue(userAtom);
  const fetching = useAtomValue(authLoadingAtom);

  return {
    user,
    fetching,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
  };
}

export default useAuth;