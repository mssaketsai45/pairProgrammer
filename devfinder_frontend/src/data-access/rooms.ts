import { Room } from "@/db/schema";
import { api } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

export async function getRooms(search: string | undefined) {
  return await api.rooms.getAll(search);
}

export async function getUserRooms() {
  const session = await getSession();
  if (!session) {
    throw new Error("User not authenticated");
  }
  
  // Use the dedicated user rooms endpoint
  return await api.rooms.getByUserId(session.user.id);
}

export async function getRoom(roomId: string) {
  return await api.rooms.getById(roomId);
}

export async function deleteRoom(roomId: string) {
  await api.rooms.delete(roomId);
}

export async function createRoom(
  roomData: Omit<Room, "id" | "userId">,
  userId: string
) {
  return await api.rooms.create({ ...roomData, userId });
}

export async function editRoom(roomData: Room) {
  const { id, ...updateData } = roomData;
  return await api.rooms.update(id, updateData);
}
