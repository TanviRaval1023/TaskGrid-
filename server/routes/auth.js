const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Task = require("../models/Task");

const {
  sendPasswordResetEmail
} = require("../services/emailService");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});


// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    // Do not reveal whether an email exists
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token in database
    user.resetPasswordToken = resetToken;

    // Token expires after 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create password reset link
    const resetLink =
      `http://localhost:5173/?resetToken=${resetToken}`;

    // Send reset email
    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetLink
    );

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Unable to process password reset request"
    });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Find user with a valid and non-expired reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });

    // Token is invalid or expired
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link."
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    user.password = hashedPassword;

    // Remove reset token after successful reset
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Unable to reset password"
    });
  }
});



// DELETE ACCOUNT
router.delete("/delete-account", async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({
        message: "User ID and password are required"
      });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Verify the current password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    // Delete all tasks belonging to this user
    await Task.deleteMany({
      userId: user._id
    });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    res.json({
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);

    res.status(500).json({
      message: "Unable to delete account"
    });
  }
});



module.exports = router;