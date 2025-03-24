#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import user from "../src/model/user.js";
import createRepo from "../src/commands/create.js";
import deleteRepo from "../src/commands/delete.js";

const showHelp = () => {
  console.log(chalk.blue("Usage: frepo <command> [options]"));
  console.log(chalk.green("\nAvailable commands:\n"));
  console.log(
    chalk.yellow("  frepo auth        ") + "Authenticate with GitHub"
  );
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
          { name: "Delete a repository", value: "del" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    if (action === "exit") process.exit(0);
    args.push(action);
  }

  switch (args[0]) {
    case "--help":
      showHelp();
      break;

    case "auth":
      try {
        await user.authenticate();
        console.log(chalk.green("✅ Authentication successful!"));
      } catch (error) {
        console.log(chalk.red(`❌ ${error}`));
        process.exit(1);
      }
      break;

    case "new":
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

    default:
      console.log(
        chalk.red(
          "❌ Unknown command! Use 'frepo --help' for usage instructions."
        )
      );
      process.exit(1);
  }
};

main().catch(() => {
  console.log(chalk.yellow("⚠️ Operation canceled."));
  process.exit(0);
});
