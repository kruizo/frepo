import axios from "axios";
import { ensureAuth } from "../commands/auth.js";
import chalk from "chalk";

class User {
  constructor() {
    this.token = null;
    this.username = null;
  }

  async authenticate() {
    if (!this.token) {
      this.token = await ensureAuth();
    }
    return this.token;
  }

  async getUsername() {
    if (this.username) return this.username;

    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${this.token}` },
      });
      this.username = response.data.login;
      return this.username;
    } catch (error) {
      console.error(
        chalk.red("❌ Error fetching GitHub username:", error.message)
      );
      process.exit(1);
    }
  }
}

export default new User();
