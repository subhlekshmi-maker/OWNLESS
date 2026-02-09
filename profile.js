import { supabase } from "./supabaseClient.js";
import { getCurrentUser } from "./auth.js";

export async function getProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.warn("Could not load profile:", error);
        // Fallback if profile doesn't exist yet
        return {
            username: user.email.split("@")[0],
            email: user.email,
            created_at: user.created_at,
        };
    }

    return { ...data, email: user.email };
}

export async function getMyListings() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading listings:", error);
        return [];
    }

    return data;
}
