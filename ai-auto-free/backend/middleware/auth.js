const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const db = require("../database/db");

// Private ve public key'leri oku
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "..", "private.pem"), "utf8");
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, "..", "public.pem"), "utf8");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });

      // Admin token'ı kontrolü
      if (decoded.id === "admin" && decoded.isAdmin === true) {
        // Admin kullanıcısı için özel işlem
        req.user = {
          uuid: "admin",
          isAdmin: true,
        };
        return next();
      }

      // Normal kullanıcı için işlem
      const user = await db.getUserByUuid(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Kullanıcı bilgilerini request nesnesine ekle
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Token kontrol hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Token oluşturma yardımcı fonksiyonu
const createUserInfoToken = (user) => {
  return jwt.sign(
    {
      id: user.uuid,
      credits: user.credits,
    },
    PRIVATE_KEY,
    { algorithm: "RS256" }
  );
};

module.exports = {
  authenticateToken,
  createToken: createUserInfoToken,
  PRIVATE_KEY,
  PUBLIC_KEY,
};
