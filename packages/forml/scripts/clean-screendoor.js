import fs from "node:fs/promises";
import { createUniqueKeyFn } from "../src/form/string.js";

const TypeMappings = {
	date: "day",
	checkboxes: "selectboxes",
	dropdown: "select",
	phone: "phoneNumber",
	block_of_text: "htmlelement"
};

const uniqueKey = createUniqueKeyFn();

function convertFields(
	fields)
{
	return fields.map((field) => {
		const { field_type, id, hasDependentShortcuts, conditions, ...rest } = field;
		let type = TypeMappings[field_type] || field_type;

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
		} else if (type === "htmlelement" && rest.description) {
			rest.content = rest.description;
			delete rest.description;
			delete rest.label;
		} else if (type === "section_break") {
			const { label, description } = rest;

			type = "htmlelement";
			rest.content = `<h2>${label}</h2>\n` + (description ? `<h3>${description}</h3}` : "");
			delete rest.label;
			delete rest.description;
		}

		if (Array.isArray(conditions) && conditions.length) {
			if (conditions.length === 1) {
				const [condition] = conditions;

				if (condition.method === "eq") {
					rest.conditional = {
						show: true,
						when: condition.response_field_id,
						eq: true,
					}
				} else {
					console.error("Unknown condition", condition, rest);
				}
			} else {
				console.error("Too many conditions", rest);
			}
		}

		delete rest.type;
		delete rest.value;
		delete rest.size;

		return {
			type,
			key: id,
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
