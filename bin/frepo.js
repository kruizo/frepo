#!/usr/bin/env node

import axios from "axios";
import inquirer from "inquirer";
import chalk from "chalk";
import open from "open";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import os from "os";

dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const TOKEN_PATH = path.join(os.homedir(), ".frepo_token");

const getStoredToken = () => {
  if (fs.existsSync(TOKEN_PATH)) {
    return fs.readFileSync(TOKEN_PATH, "utf8").trim();
  }
  return null;
};

const storeToken = (token) => {
  fs.writeFileSync(TOKEN_PATH, token, "utf8");
};

const authenticate = async () => {
  return new Promise((resolve, reject) => {
    const app = express();
    const server = app.listen(3000, () => console.log(chalk.blue("Waiting for GitHub authentication...")));

    app.get("/callback", async (req, res) => {
      const { code } = req.query;
      if (!code) {
        res.send("No code received.");
        return reject("GitHub authentication failed.");
      }

      try {
        const response = await axios.post(
          "https://github.com/login/oauth/access_token",
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
          },
          { headers: { Accept: "application/json" } }
        );

        const token = response.data.access_token;
        storeToken(token);

        res.send("Authentication successful! You can close this tab.");
        server.close();
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });

    open(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`);
  });
};

const createRepo = async (repoName, token) => {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName },
      { headers: { Authorization: `token ${token}` } }
    );

    console.log(chalk.green(`Repository created: ${response.data.html_url}`));
  } catch (error) {
    console.error(chalk.red("Error creating repository:", error.response?.data?.message || error.message));
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2 || args[0] !== "new") {
    console.log(chalk.red("Usage: frepo new <repo-name>"));
    process.exit(1);
  }

  const repoName = args[1];
  let token = getStoredToken();

  if (!token) {
    console.log(chalk.yellow("No GitHub token found. Authenticating..."));
    token = await authenticate();
  }

  await createRepo(repoName, token);
};

main();

