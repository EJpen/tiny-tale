import { prisma } from "../core/services/prisma.service";
import { ResponseService } from "../core/services/response.service";
import { paginate } from "../core/services/pagination.service";

export const getUsers = async (page?: number, limit?: number) => {
  try {
    const result = await paginate({
      model: prisma.user,
      page,
      limit,
      orderBy: { createdAt: "desc" },
    });

    return ResponseService.success(result, "Users fetched successfully");
  } catch (error) {
    console.error("Error fetching users:", error);
    return ResponseService.error("Failed to fetch users");
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
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
    console.log("🔍 Creating user with username:", username);
    console.log("🔍 DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "🔍 DATABASE_URL (first 50 chars):",
      process.env.DATABASE_URL?.substring(0, 50)
    );

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return ResponseService.conflict("Username already exists");
    }

    const user = await prisma.user.create({
      data: { username },
    });

    console.log("✅ User created successfully:", user.id);
    return ResponseService.success(user, "User created successfully", 201);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    console.error("❌ Error details:", {
      name: (error as any)?.name,
      message: (error as any)?.message,
      code: (error as any)?.code,
    });
    return ResponseService.error("Failed to create user");
  }
};

export const updateUser = async (id: string, data: { username?: string }) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return ResponseService.notFound("User");
    }

    // Check if new username already exists (if username is being updated)
    if (data.username && data.username !== existingUser.username) {
      const duplicateUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (duplicateUser) {
        return ResponseService.conflict("Username already exists");
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return ResponseService.success(user, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return ResponseService.error("Failed to update user");
  }
};

//wip:
// export const deleteUser = async (id: string) => {
//   try {
//     const existingUser = await prisma.user.findUnique({
//       where: { id },
//     });

//     if (!existingUser) {
//       return ResponseService.notFound("User");
//     }

//     await prisma.user.delete({
//       where: { id },
//     });

//     return ResponseService.success(null, "User deleted successfully");
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     return ResponseService.error("Failed to delete user");
//   }
// };
