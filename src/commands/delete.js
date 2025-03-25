import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import dotenv from "dotenv";
import { getStoredToken } from "../utils/token.js";
dotenv.config();

const deleteRepo = async (repoName, autoConfirm = false) => {
  const { TOKEN, USERNAME } = getStoredToken();

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
    const repoUrl = `https://api.github.com/repos/${USERNAME}/${repoName}`;
    console.log("Deleting repository...");
    const repoResponse = await axios.get(repoUrl, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    if (repoResponse.data.private) {
      console.log(
        chalk.yellow("⚠️ Deleting a private repo. Proceed with caution!")
      );
    }

    const branchesResponse = await axios.get(`${repoUrl}/branches`, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    if (branchesResponse.data.length > 1) {
      console.log(
        chalk.red("❌ Cannot delete repository with multiple branches!")
      );
      return;
    }

    await axios.delete(repoUrl, {
      headers: { Authorization: `token ${TOKEN}` },
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
