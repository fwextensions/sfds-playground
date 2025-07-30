import XLSX from "xlsx";
import fs from "node:fs";
import { camelCase } from "forml/src/form/string.js";
import { generateForm } from "forml/src/form/generateForm.js";

const ContainerComponents = new Set([
	"form",
	"panel",
	"section",
	"fieldset",
	"container",
	"serviceSection",
]);

function createComponent(
	data)
{
	const { type, key, required, label, conditions, other = "" } = data;
	const baseKeys = { type, key, required };

	if (!["radio", "select"].includes(type) && conditions) {
		const data = JSON.parse(conditions);

		Object.assign(baseKeys, data);
	}

	switch (type) {
		case "serviceOffering":
			return {
				...baseKeys,
				name: label,
				examples: other.trim(),
			};

		case "serviceSection":
		case "fieldset":
			return {
				...baseKeys,
				legend: label,
				description: other.trim(),
			};

		case "htmlelement":
			return {
				...baseKeys,
				tag: label,
				content: other.trim(),
			};

		case "panel":
			return {
				...baseKeys,
				title: label,
			};

		case "radio":
			return {
				...baseKeys,
				label,
				values: JSON.parse(conditions),
			};

		case "select":
			return {
				...baseKeys,
				label,
				data: {
					values: JSON.parse(conditions),
				}
			};

		default:
			return {
				...baseKeys,
				label,
			};
	}
}

function canContain(
	parent,
	child)
{
	const parentType = parent?.type;
	const childType = child?.type;

	// TODO: this doesn't handle arbitrary depth of parent/child relationships

	if (childType === "panel") {
		return parentType === "form";
	} else if (ContainerComponents.has(childType) && parentType !== "panel" && childType !== "container") {
		return false;
	}

	return !!parentType || ContainerComponents.has(parentType);
}

function buildForm(
	items)
{
	const iterator = items[Symbol.iterator]();
	const stack = [];
	let currentParent = {
		type: "form",
		components: [],
	};
	let current = iterator.next();

	stack.push(currentParent);

	while (!current.done) {
		const component = createComponent(current.value);

		if (component.type) {
			if (!ContainerComponents.has(component.type)) {
				currentParent.components.push(component);
			} else {
				component.components = [];

				while (!canContain(currentParent, component)) {
					stack.pop();
					currentParent = stack.at(-1);
				}

				currentParent.components.push(component);
				currentParent = component;
				stack.push(component);
			}
		}

		current = iterator.next();
	}

	return stack[0];
}

const spreadsheetFilePath = process.argv[2];
const outputFilePath = process.argv[3] || "form.formio.json";

XLSX.set_fs(fs);

const workbook = XLSX.readFile(spreadsheetFilePath);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const range = XLSX.utils.decode_range(worksheet["!ref"]);

for (let col = range.s.c; col <= range.e.c; col++) {
	const headerCell = XLSX.utils.encode_cell({ r: range.s.r, c: col });
	const cell = worksheet[headerCell];

	if (cell) {
			// update all the copies of the string, since either h or w is used in the
			// transformation to JSON
		cell.v = cell.h = cell.w = camelCase(cell.v);
	}
}

const sheetObjects = XLSX.utils.sheet_to_json(worksheet);
//console.log(sheetObjects.slice(33, 37));

//const formData = buildForm(sheetObjects.slice(33));
const formData = buildForm(sheetObjects);

const form = generateForm(formData);

fs.writeFileSync(outputFilePath, JSON.stringify(form, null, 2));
