const API_BASE_URL = process.env.APP_URL || "";

// API Types
export interface User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  trusteeId: string;
  roomName: string;
  gender: "male" | "female";
  isClose?: boolean;
  roomUrl?: string;
  ownerPin?: string;
  memberPin?: string;
  trustee: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicRoom {
  id: string;
  trusteeId: string;
  roomName: string;
  isClose?: boolean;
  // gender excluded for security
  roomUrl?: string;
  ownerPin?: string;
  memberPin?: string;
  trustee: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  roomId: string;
  name: string;
  gender: "male" | "female";
  isOut: boolean;
  room: {
    id: string;
    roomName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API Functions
export const api = {
  // Users
  async createUser(username: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return response.json();
  },

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/users`);
    return response.json();
  },

  // Rooms
  async createRoom(data: {
    trusteeId: string;
    roomName: string;
    gender: "male" | "female";
  }): Promise<ApiResponse<Room>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getRoom(roomId: string): Promise<ApiResponse<Room>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/rooms/${roomId}`);
    return response.json();
  },

  async getRoomPublic(roomId: string): Promise<ApiResponse<PublicRoom>> {
    const response = await fetch(
      `${API_BASE_URL}/api/routes/rooms/${roomId}/public`
    );
    return response.json();
  },

  async getRooms(): Promise<ApiResponse<Room[]>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/rooms`);
    return response.json();
  },

  // Votes
  async createVote(data: {
    roomId: string;
    name: string;
    gender: "male" | "female";
    isOut: boolean;
  }): Promise<ApiResponse<Vote>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getVotes(filters?: {
    roomId?: string;
    name?: string;
    gender?: string;
    isOut?: boolean;
  }): Promise<ApiResponse<Vote[]>> {
    const url = new URL(`${API_BASE_URL}/api/routes/votes`);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(url.toString());
    return response.json();
  },

  async updateVote(
    voteId: string,
    data: {
      isOut?: boolean;
      gender?: "male" | "female";
    }
  ): Promise<ApiResponse<Vote>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/votes/${voteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteVote(voteId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/api/routes/votes/${voteId}`, {
      method: "DELETE",
    });
    return response.json();
  },

  async verifyHostPin(
    roomId: string,
    pin: string
  ): Promise<ApiResponse<{ verified: boolean; gender: "male" | "female" }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/routes/rooms/${roomId}/verify-pin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      }
    );
    return response.json();
  },

  async closeRoom(
    roomId: string,
    isClose: boolean
  ): Promise<ApiResponse<Room>> {
    const response = await fetch(
      `${API_BASE_URL}/api/routes/rooms/${roomId}/close-room`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isClose }),
      }
    );
    return response.json();
  },
};
