const bcrypt = require("bcrypt");

async function verifyPassword() {
  const plainPassword = "supersecurepassword";
  const hashedPassword = "$2b$10$RRNylpR0mKCDL34mdQEWbOXZ8nohvhtdMdRCvGHbK/5eU/h7Gs.xi";

  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("Password match:", isMatch);
  } catch (error) {
    console.error("Error comparing password:", error.message);
  }
}

verifyPassword();


