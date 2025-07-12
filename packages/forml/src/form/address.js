//import skeleton from "./address.yaml" assert { type: "text" };
import yaml from "yaml";
import { readFile } from "node:fs/promises";

const skeleton = await readFile(new URL("./address.yaml", import.meta.url), "utf-8");

export function address(
	data,
	context)
{
		// create a copy of the skeleton so each component is separate
	const component = yaml.parse(skeleton);

	component.key = data.key;
	component.tableView = true;
	component.input = true;

	if (data.conditional) {
		component.conditional = data.conditional;
	}

	return component;
}
