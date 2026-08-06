import { atom } from "jotai";
import store from "./store";
import {
  getCurrentUser,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
} from "../api/auth";

// Global, shared auth state so every component (Header, pages) sees the same
// user and reacts immediately to login/logout without stale copies.
export const userAtom = atom(null);

// True while the session is being restored on first load.
export const authLoadingAtom = atom(true);

export async function initAuth() {
  try {
    const user = await getCurrentUser();
    store.set(userAtom, user);
  } catch {
    store.set(userAtom, null);
  } finally {
    store.set(authLoadingAtom, false);
  }
}

export async function handleLogin(credentials) {
  const user = await apiLogin(credentials);
  store.set(userAtom, user);
  return user;
}

export async function handleSignup(credentials) {
  const user = await apiSignup(credentials);
  store.set(userAtom, user);
  return user;
}

export async function handleLogout() {
  await apiLogout();
  store.set(userAtom, null);
}

export async function handleUpdateProfile(patch) {
  const user = await apiUpdateProfile(patch);
  store.set(userAtom, user);
  return user;
}