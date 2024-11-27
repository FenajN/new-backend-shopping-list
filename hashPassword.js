const bcrypt = require("bcrypt");

async function generateHash() {
  const plainPassword = "supersecurepassword";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  console.log("Hashed password:", hashedPassword);
}

generateHash();

