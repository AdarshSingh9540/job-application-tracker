
export const authMiddleware = (req, res, next) => {
  const user_id = req.body?.userId;
  const sessionToken = req.cookies?.["next-auth.session-token"];

  if (!user_id || !sessionToken) {
    return res.status(400).json({ r: "e", e: "Missing userId or sessionToken" });
  }

  console.log("🔐 AuthMiddleware → Received:", { user_id, sessionToken });

  req.user = { user_id, sessionToken };

  next();
};
