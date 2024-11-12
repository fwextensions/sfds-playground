import { parse } from "yaml";
import XLSX from "xlsx";
import fs from "node:fs";

const yamlFilePath = process.argv[2];
const outputFilePath = process.argv[3] || "form.xlsx";

const data = parse(fs.readFileSync(yamlFilePath, "utf-8"));
const headers = [
	["Type", 14],
	["Key", 24],
	["Required", 8],
	["Label", 50],
	["Other", 50],
];
const rows = [headers.map(([name]) => name)];

function getCells(
	component)
{
	const { type, key, required, label, title } = component;
	const baseKeys = [type, key, required];

	switch (type) {
		case "serviceOffering":
			return [...baseKeys, component.name, component.examples];

		case "fieldset":
			return [...baseKeys, component.legend, component.description];

		case "htmlelement":
			return [...baseKeys, component.tag, component.content];

		default:
			return [...baseKeys, label ?? title];
	}
}

function outputComponents(
	components,
	rows)
{
	for (const component of components) {
		rows.push(getCells(component));

		if (component.components) {
			if (rows.at(-1).length) {
				rows.push([]);
			}

			outputComponents(component.components, rows);
			rows.push([]);
		}
	}
}

outputComponents(data.components, rows);

XLSX.set_fs(fs);

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(rows);

worksheet["!cols"] = headers.map(([, wch]) => ({ wch }));

XLSX.utils.book_append_sheet(workbook, worksheet, "Form");
XLSX.writeFile(workbook, outputFilePath);

//console.log(rows);
