import fs from "fs";
import path from "path";
import os from "os";

const TOKEN_PATH = path.join(os.homedir(), ".frepo_token");

export function getToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    return fs.readFileSync(TOKEN_PATH, "utf8").trim();
  }
  return null;
}

export function storeToken(token) {
  fs.writeFileSync(TOKEN_PATH, token, "utf8");
}

export const removeToken = () => {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
};
