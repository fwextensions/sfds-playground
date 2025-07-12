import { parse } from "yaml";
import XLSX from "xlsx";
import fs from "node:fs";

const yamlFilePath = process.argv[2];
const outputFilePath = process.argv[3] || "form.xlsx";

const data = parse(fs.readFileSync(yamlFilePath, "utf-8"));
const headers = [
	["Type", 14],
	["Key", 29],
	["Required", 8],
	["Label", 50],
	["Other", 50],
	["Conditions", 50],
];
const rows = [headers.map(([name]) => name)];

function getCells(
	component)
{
	const { type, key, required, label, title } = component;
	const baseKeys = [type, key, required];
	const conditions = component.conditions ?? component.conditional;
	const conditionsJSON = conditions ? JSON.stringify(conditions) : undefined;

	// TODO: put rest of component properties into a cell of JSON

	switch (type) {
		case "serviceOffering":
			return [...baseKeys, component.name, component.examples, conditionsJSON];

		case "fieldset":
			return [...baseKeys, component.legend, component.description, conditionsJSON];

		case "htmlelement":
			return [...baseKeys, component.tag, component.content, conditionsJSON];

		case "radio":
		case "selectboxes":
			return [...baseKeys, label, undefined, JSON.stringify(component.values)];

		default:
			return [...baseKeys, label ?? title, undefined, conditionsJSON];
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
