import XLSX from "xlsx";
import fs from "node:fs";
//import fs from "node:fs/promises";

XLSX.set_fs(fs);

const json = fs.readFileSync("test.json", "utf8");
const data = JSON.parse(json);
console.log(data[0].data);


//const json = await fs.readFile("test.json", "utf8");
const worksheet = XLSX.utils.json_to_sheet(data[0].data);
const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

console.log(workbook);
XLSX.writeFile(workbook, "test.xlsx");
