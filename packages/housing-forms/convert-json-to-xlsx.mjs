import XLSX from "xlsx";
import fs from "node:fs";

function setRecordRowCol(
	rows,
	i,
	key,
	value)
{
	rows[i] ??= {};
	rows[i][key] = value;
}

function processRecords(
	records)
{
	const rows = [];

	for (const record of records) {
		const recordRows = [];

		setRecordRowCol(recordRows, 0, "ID", record._id);
		setRecordRowCol(recordRows, 0, "Created", record.created);
		setRecordRowCol(recordRows, 0, "Modified", record.modified);

		for (const [key, value] of Object.entries(record.data)) {
			if (Array.isArray(value)) {
				value.forEach((gridRow, i) => {
					for (const [gridKey, gridValue] of Object.entries(gridRow)) {
						setRecordRowCol(recordRows, i, `${key}.${gridKey}`, gridValue);
					}
				})
			} else {
				setRecordRowCol(recordRows, 0, key, value);
			}
		}

		rows.push(...recordRows);
	}

	return rows;
}

XLSX.set_fs(fs);

const HeaderPattern = /^"(.+)"$/;

const columns = fs.readFileSync("columns.csv", "utf-8").trim().split(",")
	.map((name) => name.replace(HeaderPattern, "$1"));
const data = JSON.parse(fs.readFileSync("test.json", "utf-8"));

const rows = processRecords(data);

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns });

XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
XLSX.writeFile(workbook, "output.xlsx");
