require("dotenv").config(); // Load environment variables from .env
const { verifyUser } = require("../src/utils/userVerify.js");

async function testVerifyUser() {
  const testCases = [
    { username: "admin", password: "your_secure_password" },
    { username: "invalidUser", password: "password123" },
    { username: "admin", password: "wrongPassword" },
  ];

  for (const { username, password } of testCases) {
    console.log(`Testing username: "${username}", password: "${password}"`);
    try {
      const result = await verifyUser(username, password);
      if (result) {
        console.log("✔ User verified:", result);
      } else {
        console.log("✖ Verification failed: Invalid credentials");
      }
    } catch (err) {
      console.error("✖ Error during verification:", err.message);
    }
    console.log("-----");
  }
}

testVerifyUser();
