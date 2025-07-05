"use server";

import { getSession } from "@/lib/auth";
import { StreamChat } from "stream-chat";

export async function generateTokenAction() {
  const session = await getSession();

  if (!session) {
    throw new Error("No session found");
  }

  const api_key = process.env.NEXT_PUBLIC_GET_STREAM_API_KEY!;
  const api_secret = process.env.GET_STREAM_SECRET_KEY!;
  
  // Check if credentials are properly configured
  if (!api_key || api_key === "1372398" || !api_secret || api_secret === "1372398") {
    throw new Error("Stream.io credentials not properly configured");
  }
  
  try {
    const serverClient = StreamChat.getInstance(api_key, api_secret);
    const token = serverClient.createToken(session.user.id);
    console.log("token", token);
    return token;
  } catch (error) {
    console.error("Failed to generate Stream.io token:", error);
    throw new Error("Failed to generate video chat token");
  }
}
