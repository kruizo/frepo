import express from "express";
import axios from "axios";
import chalk from "chalk";
import open from "open";
import { storeToken, getToken } from "../utils/token.js";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export const authenticate = async () => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
      "Missing GitHub Client ID or Secret. Please check your environment variables."
    );
  }

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

        res.send("✅ Authentication successful! You can close this tab.");
        server.close();
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });

    open(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,delete_repo`
    );
  });
};

export const ensureAuth = async () => {
  let token = getToken();

  if (!token) {
    console.log(chalk.yellow("🔑 No GitHub token found. Authenticating..."));
    token = await authenticate();
  }

  return token;
};
