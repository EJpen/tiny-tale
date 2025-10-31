import { supabaseAdmin } from "../../../lib/supabase-admin";
import { ResponseService } from "../core/services/response.service";

export const getUsers = async (page?: number, limit?: number) => {
  try {
    const pageSize = limit || 10;
    const from = ((page || 1) - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase error:", error);
      return ResponseService.error("Failed to fetch users");
    }

    const result = {
      data,
      pagination: {
        total: count || 0,
        page: page || 1,
        limit: pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };

    return ResponseService.success(result, "Users fetched successfully");
  } catch (error) {
    console.error("Error fetching users:", error);
    return ResponseService.error("Failed to fetch users");
  }
};

export const getUserById = async (id: string) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return ResponseService.notFound("User");
    }

    return ResponseService.success(user, "User fetched successfully");
  } catch (error) {
    console.error("Error fetching user:", error);
    return ResponseService.error("Failed to fetch user");
  }
};

export const createUser = async (username: string) => {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return ResponseService.conflict("Username already exists");
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ username })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error creating user:", error);
      return ResponseService.error("Failed to create user");
    }

    console.log("✅ User created successfully:", user.id);
    return ResponseService.success(user, "User created successfully", 201);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return ResponseService.error("Failed to create user");
  }
};

export const updateUser = async (id: string, data: { username?: string }) => {
  try {
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingUser) {
      return ResponseService.notFound("User");
    }

    // Check if new username already exists (if username is being updated)
    if (data.username && data.username !== existingUser.username) {
      const { data: duplicateUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("username", data.username)
        .single();

      if (duplicateUser) {
        return ResponseService.conflict("Username already exists");
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating user:", error);
      return ResponseService.error("Failed to update user");
    }

    return ResponseService.success(user, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return ResponseService.error("Failed to update user");
  }
};
