import fs from "fs";
import path from "path";
import os from "os";
import chalk from "chalk";

const TOKEN_PATH = path.join(os.homedir(), ".frepo");

export function getStoredToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const content = fs.readFileSync(TOKEN_PATH, "utf8").trim();
    const lines = content.split("\n");
    const data = {};

    for (const line of lines) {
      const [key, value] = line.split("=");
      if (key && value) data[key.trim()] = value.replace(/"/g, "").trim();
    }

    return data;
  }
  return null;
}

export function storeToken(token, username) {
  const data = `TOKEN="${token}"\nUSERNAME="${username}"\n`;
  fs.writeFileSync(TOKEN_PATH, data, "utf8");
  console.log(`🔒 Credentials stored in ${TOKEN_PATH}`);
}

export const removeStoredToken = () => {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
    console.log(chalk.yellow("⚠️ Token removed."));
  }
};

export const isStoredTokenExist = () => fs.existsSync(TOKEN_PATH);
