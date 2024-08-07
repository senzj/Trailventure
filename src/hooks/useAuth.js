import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, userCollectionRef } from "../utils/firebase"; // Ensure db is imported
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods

// listening for live user session data
function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fetching, setFetching] = useState(true);

  // add listener on component mount
  useEffect(() => {
    // listen for changes to the user session data and set the user state
    const unSubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setFetching(true);

        if (user) {
          const docRef = doc(userCollectionRef, user.uid);
          const userDoc = await getDoc(docRef);

          if (userDoc.exists()) {
            setUser({ ...user, ...userDoc.data() });
          } else {
            setUser(user);
          }
        } else {
          setUser(null);
        }

        setFetching(false);
      } catch (error) {
        setFetching(false);
      }
    });

    // when the component unmounts, remove the listener to avoid memory leaks
    return () => unSubscribeAuth();
  }, [navigate]);

  // return user session data
  // user can be User object or null
  // https://firebase.google.com/docs/reference/js/v8/firebase.User
  return { user, fetching };
}

export default useAuth;
