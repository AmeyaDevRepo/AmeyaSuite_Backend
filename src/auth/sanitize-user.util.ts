export function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, ...rest } = user;
  return rest;
}
