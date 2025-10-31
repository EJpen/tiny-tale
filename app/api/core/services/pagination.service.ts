import prisma from "../../config/prisma";

// Define the options our paginate function will accept
interface PaginateOptions {
  model: any;
  page?: number;
  limit?: number;
  select?: any;
  where?: any;
  orderBy?: any;
}

export const paginate = async (options: PaginateOptions) => {
  const { model, page = 1, limit = 10, select, where, orderBy } = options;

  // Ensure page and limit are positive integers
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100)); // Cap at 100 to prevent abuse

  const skip = (safePage - 1) * safeLimit;

  const [data, totalItems] = await prisma.$transaction([
    model.findMany({
      where,
      select,
      skip,
      take: safeLimit,
      orderBy,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
};
