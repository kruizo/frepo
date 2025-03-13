import axios from "axios";
import chalk from "chalk";
import { getToken, removeToken } from "../utils/token.js";
import dotenv from "dotenv";

dotenv.config();

const logout = async () => {
  const token = getToken();

  if (!token) {
    console.log(chalk.yellow("⚠️ No active GitHub session found."));
    return;
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.log(
      chalk.red(
        "❌ Missing GitHub Client ID or Secret. Please check your environment variables."
      )
    );
    return;
  }

  try {
    await axios.delete(
      `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`,
      {
        auth: {
          username: process.env.GITHUB_CLIENT_ID,
          password: process.env.GITHUB_CLIENT_SECRET,
        },
        data: { access_token: token },
      }
    );

    removeToken();
    console.log(chalk.green("✅ Successfully logged out from GitHub."));
  } catch (error) {
    console.error(
      chalk.red("❌ Failed to revoke token:"),
      error.response?.data || error.message
    );
  }
};

// Run logout when executed directly
logout();
