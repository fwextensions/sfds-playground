import fs from "node:fs/promises";
import { createUniqueKeyFn } from "../src/form/string.js";

const TypeMappings = {
	date: "day",
	checkboxes: "selectboxes",
	dropdown: "select",
	phone: "phoneNumber",
};

const uniqueKey = createUniqueKeyFn();

function convertFields(
	fields)
{
	return fields.map((field) => {
		const { field_type, hasDependentShortcuts, ...rest } = field;
		const type = TypeMappings[field_type] || field_type;

		if (rest.options) {
			const values = rest.options.map(({ label, value = uniqueKey(label) }) => ({
				label,
				value,
			}));

			delete rest.options;

			if (type === "select") {
				rest.data = { values };
			} else {
				rest.values = values;
			}
		}

		delete rest.type;
		delete rest.value;
		delete rest.size;

		return {
			type,
			...rest,
		}
	});
}

function createFieldSets(
	components)
{
	const result = [];
	let fs;

	for (const c of components) {
		if (c.type.endsWith("break")) {
			if (fs) {
				result.push(fs);
			}

			if (c.type === "section_break") {
				const { key, label, description } = c;

				fs = {
					type: "fieldSet",
					key,
					label: label + (description ? "<br><br>" + description : ""),
					components: [],
				};
			} else {
				result.push(c);
			}
		} else if (fs) {
			fs.components.push(c);
		} else {
			result.push(c);
		}
	}

	if (fs) {
		result.push(fs);
	}

	return result;
}

const jsonFilePath = process.argv[2];
const outputFilePath = process.argv[3] || "formio.json";

if (!jsonFilePath) {
	console.error("Please provide the path to the JSON file as a command line argument.");
	process.exit(1);
}

(async () => {
	const jsonData = await fs.readFile(jsonFilePath, "utf8");
	const fields = JSON.parse(jsonData);
	const components = convertFields(fields);
	const outputData = {
		title: "DALP",
		name: "dalp",
		type: "form",
		components,
	};

	await fs.writeFile(outputFilePath, JSON.stringify(outputData, null, "\t"));
//	console.log(components);
})();
