const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText);
  }

  const data = await response.json();
  // Many backend endpoints return { success: true, data: [...] }
  // If the response has a data property, return that, otherwise return the whole response
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Room endpoints
  rooms: {
    getAll: (search?: string) => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      return apiRequest<any[]>(`/api/rooms${params}`);
    },
    getById: (id: string) => apiRequest<any>(`/api/rooms/${id}`),
    getByUserId: (userId: string) => apiRequest<any[]>(`/api/rooms/user/${userId}`),
    create: (data: any) => apiRequest<any>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/api/rooms/${id}`, {
      method: 'DELETE',
    }),
  },
  // User endpoints
  users: {
    getAll: () => apiRequest<any[]>('/api/users'),
    create: (data: any) => apiRequest<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};
