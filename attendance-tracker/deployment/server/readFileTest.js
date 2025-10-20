import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "models", "members.json");

try {
  const data = fs.readFileSync(filePath, "utf-8");
  console.log("File content:", data);
} catch (err) {
  console.error("Error reading file:", err);
}
