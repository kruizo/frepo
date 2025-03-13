import axios from "axios";
import chalk from "chalk";
import user from "../model/user.js";

export default async function createRepo(repo_name) {
  await user.authenticate();
  const username = await user.getUsername();
  const repoUrl = `https://api.github.com/repos/${username}/${repo_name}`;

  try {
    await axios.get(repoUrl, {
      headers: { Authorization: `token ${user.token}` },
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
    console.log(chalk.blue("Creating repository..."));
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name: repo_name },
      { headers: { Authorization: `token ${user.token}` } }
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
