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
//	const component = JSON.parse(JSON.stringify(skeleton));

	component.key = data.key;

	return component;
}
