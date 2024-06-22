import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

// listening for live user session data
function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // add listener on component mount
  useEffect(() => {
    // listen for changes to the user session data and set the user state
    const unSubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
    });

    // when the component unmounts, remove the listener to avoid memory leaks
    return () => unSubscribeAuth();
  }, [navigate]);

  // return user session data
  // user can be User object or null
  // https://firebase.google.com/docs/reference/js/v8/firebase.User
  return { user };
}

export default useAuth;
