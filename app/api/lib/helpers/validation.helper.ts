export const validateRequest = <T>(
  schema: any,
  data: any
): { isValid: boolean; data?: T; errors?: any } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true, data: result.data as T };
  }
  return { isValid: false, errors: result.error.format() };
};