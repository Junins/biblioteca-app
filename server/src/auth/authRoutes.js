const express = require("express");
const router = express.Router();
const controller = require("./authController");
const { authenticate } = require("./authMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authenticate, controller.me);
router.put("/me", authenticate, controller.updateMe);
router.post("/logout", controller.logout);

module.exports = router;
