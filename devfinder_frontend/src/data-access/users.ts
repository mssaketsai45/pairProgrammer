import { api } from "@/lib/api-client";

export async function deleteUser(userId: string) {
  // Note: This will call DELETE /api/users/:id endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }

  return response.json();
}
