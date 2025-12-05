const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);

    await db("users").insert({
      username,
      email,
      password_hash: hash,
      role: "user",
    });

    return res.status(201).json({ message: "Usuário criado." });
  } catch (e) {
    return res.status(400).json({ error: "Erro ao criar usuário." });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await db("users").where({ username }).first();
  if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
};

exports.me = async (req, res) => {
  const user = await db("users").where({ id: req.user.id }).first();

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
};

exports.updateMe = async (req, res) => {
  const { username, email } = req.body;

  await db("users").where({ id: req.user.id }).update({
    username,
    email,
  });

  return res.json({ message: "Dados atualizados." });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout efetuado." });
};
