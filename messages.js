import { supabase } from "./supabaseClient.js";
import { getCurrentUser } from "./auth.js";

// Load all conversations for the current user.
// This assumes a "messages" table with:
// id, item_id, sender_id, receiver_id, text, created_at
export async function loadConversations() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id,item_id,sender_id,receiver_id,text,created_at,items(title),sender:profiles!messages_sender_id_profiles_fkey(username),receiver:profiles!messages_receiver_id_profiles_fkey(username)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading conversations", error);
    return [];
  }

  return data || [];
}

// Load all messages in a conversation between current user and otherUser for a specific item
export async function loadMessages(itemId, otherUserId) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("item_id", itemId)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages", error);
    return [];
  }

  return data || [];
}

export async function sendMessage(itemId, receiverId, text) {
  if (!text || !text.trim()) return;

  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  const { data, error } = await supabase.from("messages").insert([
    {
      item_id: itemId,
      sender_id: user.id,
      receiver_id: receiverId,
      text,
    },
  ]);

  if (error) {
    console.error("Error sending message", error);
    alert("Could not send message. Please try again.");
    return null;
  }

  return data?.[0] || null;
}
