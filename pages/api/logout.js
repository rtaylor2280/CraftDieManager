export default function handler(req, res) {
  console.log("API Route Hit: /api/logout");

  // Clear the authToken cookie
  res.setHeader(
    "Set-Cookie",
    "authToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict"
  );

  return res.status(200).json({ message: "Logged out" });
}
