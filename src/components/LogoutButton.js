export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login"; // Redirect to login after successful logout
      } else {
        console.error("Failed to logout");
        alert("Logout failed. Please try again."); // Optional feedback
      }
    } catch (err) {
      console.error("Error during logout:", err);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
