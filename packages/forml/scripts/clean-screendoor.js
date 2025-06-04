import fs from "node:fs/promises";
import { basename } from "node:path";
import { createUniqueKeyFn } from "../src/form/string.js";

const TypeMappings = {
	date: "day",
	checkboxes: "selectboxes",
	dropdown: "select",
	phone: "phoneNumber",
	text: "textfield",
	paragraph: "textarea",
	confirm: "checkbox",
	block_of_text: "htmlelement",
	page_break: "panel",
};

const uniqueKey = createUniqueKeyFn();

const combineLabelDesc = ({ label, description }) => `<h3>${label}</h3>\n` + (description ? `<p>${description}</p>` : "");

function createComponent(
	field)
{
	let { field_type, id, hasDependentShortcuts, conditions, ...rest } = field;
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
		delete rest.required;
//	} else if (type === "paragraph" && rest.label) {
//		type = "htmlelement";
//		rest.content = rest.label;
//		rest.tag = "p";
//		delete rest.description;
//		delete rest.label;
//		delete rest.required;
	} else if (type === "section_break") {
		type = "htmlelement";
		rest.content = combineLabelDesc(field);
		rest.tag = "div";
		delete rest.label;
		delete rest.description;
		delete rest.required;
	} else if (type === "repeating_group") {
		type = "fieldset";
		rest.components = rest.children.map(createComponent);
		rest.legend = rest.label;
		delete rest.children;
		delete rest.label;
	} else if (type === "panel") {
		rest = {
			components: [],
			scrollToTop: true,
		};
	}

	if (Array.isArray(conditions) && conditions.length) {
		if (conditions.length === 1) {
			const [condition] = conditions;

			rest.conditional = {
				show: true,
				when: condition.response_field_id,
				eq: (condition.value ?? "").toLowerCase(),
//				eq: true,
			}

			if (condition.method !== "eq") {
				console.error("Forcing condition to eq", condition, rest);
			}
		} else {
			console.error("Too many conditions", rest);
		}
	}

	delete rest.type;
	delete rest.value;
	delete rest.size;
	delete rest.admin_only;

	return {
		type,
		key: id,
		...rest,
	}
}

function convertFields(
	fields)
{
	const form = [];
	let panel;

	for (const field of fields) {
		const component = createComponent(field);

		if (component.type === "panel") {
			form.push(component);
			panel = component;
		} else {
			if (!panel) {
				panel = {
					type: "panel",
					scrollToTop: true,
					components: [],
				};
				form.push(panel);
			}

			panel.components.push(component);
		}
	}

	return form;
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
const formName = basename(jsonFilePath, jsonFilePath.slice(jsonFilePath.lastIndexOf(".")));
const outputFilePath = process.argv[3] || `${formName}.formio.json`;

if (!jsonFilePath) {
	console.error("Please provide the path to the JSON file as a command line argument.");
	process.exit(1);
}

(async () => {
	const jsonData = await fs.readFile(jsonFilePath, "utf8");
	const fields = JSON.parse(jsonData);
	const components = convertFields(fields?.[0]?.field_data || fields);
	const outputData = {
		title: formName,
		name: formName,
		type: "form",
		components,
	};

	await fs.writeFile(outputFilePath, JSON.stringify(outputData, null, "\t"));
})();
