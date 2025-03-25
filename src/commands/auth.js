import express from "express";
import axios from "axios";
import chalk from "chalk";
import open from "open";
import {
  storeToken,
  removeStoredToken,
  isStoredTokenExist,
} from "../utils/token.js";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export const authenticateUser = async () => {
  if (isStoredTokenExist()) {
    console.log(chalk.green("✅ Already authenticated."));
    process.exit(0);
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
      "Missing GitHub Client ID or Secret. Please go to frepo directory and check your .env then run 'frepo auth'."
    );
  }

  console.log(chalk.yellow("🔑 No GitHub token found. Authenticating..."));

  return new Promise((resolve, reject) => {
    const app = express();
    const server = app.listen(3000, () =>
      console.log(chalk.blue("Waiting for GitHub authentication..."))
    );

    app.get("/callback", async (req, res) => {
      const { code } = req.query;
      if (!code) {
        res.send("No code received.");
        return reject("GitHub authentication failed.");
      }

      try {
        console.log(chalk.blue("Exchanging code for access token..."));
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
        if (!token) {
          res.send("No token received.");
          return reject("GitHub authentication failed.");
        }

        console.log(chalk.blue("Retrieving github information..."));
        const username = await fetchUsername(token);

        storeToken(token, username);

        //response
        res.send("✅ Authentication successful! You can close this tab.");
        server.close();
        resolve(token);

        // terminal
        console.log(chalk.green("✅ AUTHENTICATED "));
      } catch (error) {
        reject(error);
      }
    });

    open(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,delete_repo`
    );
  });
};

export const fetchUsername = async (token) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });
    const username = response.data.login;
    return username;
  } catch (error) {
    console.error(
      chalk.red("❌ Error fetching GitHub username:", error.message)
    );
    process.exit(1);
  }
};

export const logoutUser = () => {
  removeStoredToken();
  console.log(chalk.green("✅ Successfully logged out from GitHub."));
};
