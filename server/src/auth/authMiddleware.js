const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[1]);

  if (!token) return res.status(401).json({ error: "Token ausente." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      role: decoded.role,
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

exports.authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });
    if (req.user.role !== role)
      return res.status(403).json({ error: "Acesso negado." });

    return next();
  };
};
