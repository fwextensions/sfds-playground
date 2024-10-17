import { processComponent } from "./processComponent.js";

const Defaults = {
	type: "datagrid",
  reorder: false,
  addAnotherPosition: "bottom",
  layoutFixed: true,
  enableRowGroups: false,
  initEmpty: false,
  tableView: false,
	input: true,
	defaultValue: [{}],
};

export function table(
	data,
	context)
{
	const { key, label, required, columns, conditions } = data;
	const component = {
		...Defaults,
		key,
		label,
		required,
	};
	const [condition] = conditions;

	component.components = columns.map(({ label }) => processComponent({ label, type: "textfield" }, context));

	if (condition) {
		component.conditional = {
			show: true,
			when: condition.response_field_id,
			eq: true,
		}
	}

	return component;
}
