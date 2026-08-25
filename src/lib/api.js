import { supabase } from "./supabase";

export async function getCurrentProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, profile) {
  const { data, error } = await supabase.from("profiles").upsert({ id: userId, ...profile }).select().single();
  if (error) throw error;
  return data;
}

export async function getFeed() {
  const { data, error } = await supabase
    .from("posts")
    .select("id,body,media_url,media_type,created_at,author_id,profiles!posts_author_id_fkey(id,username,display_name,avatar_url)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function createPost(userId, body, mediaUrl = null, mediaType = null) {
  const { data, error } = await supabase.from("posts").insert({
    author_id: userId, body, media_url: mediaUrl, media_type: mediaType
  }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleFollow(followerId, followingId) {
  const { data: existing } = await supabase.from("follows")
    .select("follower_id").eq("follower_id", followerId).eq("following_id", followingId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("follows")
      .delete().eq("follower_id", followerId).eq("following_id", followingId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
  return true;
}

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase.from("messages")
    .select("*").eq("conversation_id", conversationId)
    .order("created_at", { ascending: true }).limit(100);
  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, senderId, body, mediaUrl = null, mediaType = null) {
  const { data, error } = await supabase.from("messages").insert({
    conversation_id: conversationId, sender_id: senderId, body, media_url: mediaUrl, media_type: mediaType
  }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadMedia(userId, file, folder = "posts") {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}