import { supabase } from "./supabaseClient.js";

/* SIGN UP */
export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Check your email for the confirmation link!");
}

/* LOGIN */
export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "home.html";
}

/* GOOGLE LOGIN */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/home.html'
    }
  });

  if (error) {
    alert(error.message);
  }
}

/* PROTECT PAGES */
export async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    window.location.href = "index.html";
  }
}

/* CURRENT USER (helper for other modules) */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/* LOGOUT */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}
