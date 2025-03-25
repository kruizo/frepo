import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
import { getStoredToken } from "../utils/token.js";
dotenv.config();

export default async function createRepo(repo_name) {
  const { TOKEN, USERNAME } = getStoredToken();

  try {
    await axios.get(`https://api.github.com/repos/${USERNAME}/${repo_name}`, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    console.log(
      chalk.red(
        `❌ Repository '${repo_name}' already exists. Choose a different name.`
      )
    );
    return;
  } catch (error) {
    if (!error.response || error.response.status !== 404) {
      console.error(
        chalk.red(
          `❌ Error checking repository: ${
            error.response?.data?.message || error.message
          }`
        )
      );
      return;
    }
  }

  try {
    console.log("Creating repository...");
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name: repo_name },
      { headers: { Authorization: `token ${TOKEN}` } }
    );

    console.log(
      chalk.green(`✅ Repository created: ${response.data.html_url}`)
    );
  } catch (creationError) {
    console.error(
      chalk.red(
        `❌ Error creating repository: ${
          creationError.response?.data?.message || creationError.message
        }`
      )
    );
  }
}
