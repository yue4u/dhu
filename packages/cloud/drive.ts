import { promises as fs } from "fs";
import readline from "readline";
import { google, oauth2_v2 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];
const TOKEN_PATH = "token.json";

export async function list() {
  try {
    const content = await fs.readFile("credentials.json", { encoding: "utf8" });
    const client = await authorize(JSON.parse(content));
    listFiles(client);
  } catch (err) {
    console.log("Error loading client secret file:", err);
  }
}

async function authorize(credentials: any) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  try {
    const token = await fs.readFile(TOKEN_PATH, { encoding: "utf8" });
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getAccessToken(oAuth2Client);
  }
}

function getAccessToken(oAuth2Client: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err: Error, token: string) => {
        reject(new Error("Error retrieving access token" + err));
        oAuth2Client.setCredentials(token);
        try {
          fs.writeFile(TOKEN_PATH, JSON.stringify(token));
          resolve(oAuth2Client);
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}

async function listFiles(auth: any) {
  const drive = google.drive({ version: "v3", auth });
  const { data } = await drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });

  data.files?.forEach((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}
