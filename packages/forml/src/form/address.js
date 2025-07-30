import { clone, loadYaml } from "./utils.js";

const skeleton = await loadYaml("address.yaml");

export function address(
	data,
	context)
{
		// create a copy of the skeleton so each component is separate
	const component = clone(skeleton);

	component.key = data.key;
	component.tableView = true;
	component.input = true;

	if (data.conditional) {
		component.conditional = data.conditional;
	}

	return component;
}
