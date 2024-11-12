import { stringify } from "yaml";
import { basename, extname } from "node:path";
import fs from "node:fs";

const jsonFilePath = process.argv[2];
const outputFilePath = process.argv[3] || basename(jsonFilePath, extname(jsonFilePath)) + ".yaml";

const json = fs.readFileSync(jsonFilePath, "utf-8");

fs.writeFileSync(outputFilePath, stringify(JSON.parse(json)));

console.log(`Wrote ${outputFilePath}`);
