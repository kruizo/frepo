#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import createRepo from "../src/commands/create.js";
import deleteRepo from "../src/commands/delete.js";
import { authenticateUser, logoutUser } from "../src/commands/auth.js";
import listRepos from "../src/commands/list.js";
import dotenv from "dotenv";
import { isStoredTokenExist } from "../src/utils/token.js";

dotenv.config();

const showHelp = () => {
  console.log(chalk.blue("Usage: frepo <command> [options]"));
  console.log(chalk.green("\nAvailable commands:\n"));
  console.log(
    chalk.yellow("  frepo auth        ") + "Authenticate with GitHub"
  );
  console.log(chalk.yellow("  frepo list        ") + "Shows your repo list");
  console.log(
    chalk.yellow('  frepo new "<repo>" ') + "Create a new GitHub repository"
  );
  console.log(
    chalk.yellow('  frepo del "<repo>" ') + "Delete an empty GitHub repository"
  );
  console.log(chalk.yellow("  frepo --help      ") + "Show this help menu");
};

const promptUser = async (questions) => {
  try {
    return await inquirer.prompt(questions);
  } catch (error) {
    if (error.isTtyError) {
      console.log(
        chalk.red("❌ Prompt could not be rendered in the current environment.")
      );
    } else {
      console.log(chalk.yellow("⚠️ Operation canceled."));
    }
    process.exit(0);
  }
};

const ensureAuthenticated = async () => {
  if (!isStoredTokenExist()) {
    console.log(
      chalk.yellow(
        "⚠️  🔑 No access token not found. Please run 'frepo auth' first."
      )
    );
    process.exit(1);
  }
};

const checkEnvironmentVariables = async () => {
  if (!isStoredTokenExist()) {
    console.log(
      chalk.yellow(
        "⚠️  Missing GitHub Client ID or Secret. Please check your environment variables."
      )
    );
    process.exit(1);
  }
};
const main = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    const { action } = await promptUser([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Create a new repository", value: "new" },
          { name: "Authenticate GitHub", value: "auth" },
          { name: "Show Repository List", value: "list" },
          { name: "Delete a repository", value: "del" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    if (action === "exit") process.exit(0);
    args.push(action);
  }

  // checkEnvironmentVariables();

  switch (args[0]) {
    case "--help":
      showHelp();
      break;

    case "auth":
      try {
        await authenticateUser();
      } catch (error) {
        console.log(chalk.yellow(`⚠️  ${error}`));
        process.exit(1);
      }
      break;
    case "list":
      ensureAuthenticated();
      await listRepos();
      break;
    case "new":
      ensureAuthenticated();
      let repoName = args[1];

      if (!repoName) {
        const { name } = await promptUser([
          {
            type: "input",
            name: "name",
            message: "Enter the repository name:",
          },
        ]);
        repoName = name;
      }

      await createRepo(repoName);
      break;

    case "del":
      ensureAuthenticated();

      let deleteRepoName = args[1];
      const autoConfirm = args.includes("-y");

      if (!deleteRepoName) {
        const { name } = await promptUser([
          {
            type: "input",
            name: "name",
            message: "Enter the repository name to delete:",
          },
        ]);
        if (!name) {
          console.log(
            chalk.red("❌ Please provide a repository name to delete.")
          );
          process.exit(1);
        }
        deleteRepoName = name;
      }

      await deleteRepo(deleteRepoName, autoConfirm);
      break;
    case "logout":
      ensureAuthenticated();

      logoutUser();

      break;

    default:
      console.log(
        chalk.red(
          "❌ Unknown command! Use 'frepo --help' for usage instructions."
        )
      );
      process.exit(1);
  }
};

main().catch((e) => {
  console.log(chalk.yellow("⚠️ Operation canceled.", e));
  process.exit(0);
});
