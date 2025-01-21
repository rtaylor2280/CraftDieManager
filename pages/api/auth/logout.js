export default function handler(req, res) {
  console.log("API Route Hit: /api/auth/logout");

  // Clear the authToken cookie
  res.setHeader(
    "Set-Cookie",
    "authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict"
  );

  // Respond with success
  return res.status(200).json({ success: true });
}
