import User from "@/lib/models/user";

export async function getSessionUserId(session: {
  user?: { id?: string; email?: string | null };
}): Promise<string> {
  const rawId = session?.user?.id;
  if (!rawId) {
    throw new Error("Unauthorized");
  }

  // If it's a valid 24-character hexadecimal string, return directly
  if (rawId.length === 24) {
    return rawId;
  }

  // Stale session UUID fallback
  if (session.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email.toLowerCase() });
    if (dbUser) {
      return dbUser._id.toString();
    }
  }

  return rawId;
}
