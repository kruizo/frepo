import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import user from "../model/user.js";

const deleteRepo = async (repoName, autoConfirm = false) => {
  await user.authenticate();
  const username = await user.getUsername();

  if (!autoConfirm) {
    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmDelete",
        message: `Are you sure you want to delete '${repoName}.git'?`,
        default: false,
      },
    ]);

    if (!answer.confirmDelete) {
      console.log(chalk.yellow("Deletion canceled."));
      return;
    }
  }

  try {
    const repoUrl = `https://api.github.com/repos/${username}/${repoName}`;
    const repoResponse = await axios.get(repoUrl, {
      headers: { Authorization: `token ${user.token}` },
    });

    if (repoResponse.data.private) {
      console.log(
        chalk.yellow("⚠️ Deleting a private repo. Proceed with caution!")
      );
    }

    const branchesResponse = await axios.get(`${repoUrl}/branches`, {
      headers: { Authorization: `token ${user.token}` },
    });

    if (branchesResponse.data.length > 1) {
      console.log(
        chalk.red("❌ Cannot delete repository with multiple branches!")
      );
      return;
    }

    // If the `-y` flag is passed, skip confirmation

    await axios.delete(repoUrl, {
      headers: { Authorization: `token ${user.token}` },
    });

    console.log(
      chalk.green(`✅ Repository '${repoName}' deleted successfully!`)
    );
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error deleting repository: ${
          error.response?.data?.message || error.message
        }`
      )
    );
  }
};

export default deleteRepo;
