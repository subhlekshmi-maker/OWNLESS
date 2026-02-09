// src/items.js
import { supabase } from "./supabaseClient.js";

export async function loadItems() {
  const { data, error } = await supabase
    .from("items")
    .select("*, owner:profiles(username), image_url")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

/* UPLOAD FUNCTION */
export async function uploadImage(file) {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  // Upload to 'item-images' bucket
  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  // Get Public URL
  const { data: publicURL } = supabase.storage
    .from('item-images')
    .getPublicUrl(fileName);

  return publicURL.publicUrl;
}

/* DELETE FUNCTION */
export async function deleteItem(itemId) {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting item:", error);
    alert("Error deleting item: " + error.message);
    return false;
  }
  return true;
}

export async function addItem(item) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in to list an item.");
    window.location.href = "index.html";
    return null;
  }

  const itemWithOwner = {
    ...item,
    image_url: item.image_url || null,
    owner_id: user.id,
    created_at: new Date()
  };

  const { data, error } = await supabase
    .from("items")
    .insert([itemWithOwner])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return null;
  }

  return data;
}