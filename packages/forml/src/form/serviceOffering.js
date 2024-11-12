import { processComponent } from "./processComponent.js";
import { createUniqueKeyFn } from "./string.js";

const DataGrid = {
	type: "datagrid",
	label: "",
	hideLabel: true,
	reorder: false,
	addAnotherPosition: "bottom",
	layoutFixed: true,
	enableRowGroups: false,
	initEmpty: false,
	tableView: false,
	input: true,
	defaultValue: [{}],
};
const Columns = [
	{
		key: "service",
		label: "Service name",
		type: "textfield",
	},
	{
		key: "frequency",
		label: "Frequency (e.g. daily, monthly, quarterly, as needed)",
		type: "textfield",
	},
	{
		key: "served",
		label: "Number of people served during reporting period",
		type: "number",
	},
];

const description = (examples) => `e.g. ${examples}`;
const label = (name, desc) => name[0].toUpperCase() + name.slice(1) + (desc ? `<br>(${description(desc)})` : "");

export function serviceOffering(
	data,
	context)
{
	const { uniqueKey } = context;
	const { name, examples, required, key = uniqueKey(name.split(/\W+/).slice(-5).join(" ")) } = data;
	const serviceCheckbox = {
		type: "checkbox",
		key,
		label: label(name, examples),
		required,
	};
		// we want to handle the column keys in the datagrids separately
	const gridContext = { uniqueKey: createUniqueKeyFn() };
	const serviceGrid = {
		...DataGrid,
		key: key + "_grid",
		customClass: "service-grid",
		hideLabel: true,
		components: Columns.map((column) => {
				// reset uniqueKey for each column so they can all have the same keys.
				// they'll still be unique in the spreadsheet because the key will be
				// <serviceName>_grid.<columnName>
			gridContext.uniqueKey.reset();
			return processComponent(column, gridContext);
		}),
		conditional: {
			show: true,
			when: key,
			eq: true,
		}
	};

	return [
		serviceCheckbox,
		serviceGrid
	];
}
