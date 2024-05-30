const crypto = require("crypto");

function generateIV() {
  return crypto.randomBytes(16);
}

function encrypt(pk) {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_KEY.toString(), "hex"),
    iv
  );
  let encrypted = cipher.update(pk, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(pk) {
  const parts = pk.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted = decrypted + decipher.final("utf8");
  return decrypted.toString();
}

function generateEncryptionKey() {
    const key = crypto.randomBytes(32);
    const hexKey = key.toString('hex');
    return hexKey;
}

module.exports = { encrypt, decrypt, generateIV,generateEncryptionKey };
