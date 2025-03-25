import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
import { getStoredToken } from "../utils/token.js";
dotenv.config();

export default async function listRepos() {
  const token = getStoredToken().TOKEN;

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: `Authorization: token ${token}`,
    });

    if (response.data.length === 0) {
      console.log(chalk.yellow("No repositories found."));
      return;
    }

    console.log(chalk.green("Your repositories:"));

    response.data.forEach((repo) => {
      console.log(chalk.blue(repo.name));
    });
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error listing repositories: ${
          error.response?.data?.message || error.message
        }`
      )
    );
  }
}
