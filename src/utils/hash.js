const bcrypt = require('bcrypt');

// higher rounds = more secure but slower. 12 is a solid middle ground for 2026 hardware
const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hashed;
}

async function comparePassword(plainPassword, storedHash) {
  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  return isMatch;
}

module.exports = { hashPassword, comparePassword };