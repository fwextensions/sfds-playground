import { getComponentBase } from "./getComponentBase.js";

export function processComponent(
	data,
	context)
{
	const { type, key, label, placeholder, components, columns } = data;
	const { uniqueKey } = context;
	const base = getComponentBase(data);

	if (!base) {
		return null;
//		throw new Error(`Unknown component type: ${type}`);
	}

	if (typeof base === "function") {
		return base(data, context);
	}

	const component = {
		...base,
		...data,
	};

	if (type !== "form" && !key) {
		component.key = uniqueKey(
			label
			|| placeholder
			|| component.title
			|| component.tag
			|| component.type
		);
	}

	if (label?.endsWith("*")) {
		component.label = label.slice(0, -1);
		component.required = true;
	} else if (!label && placeholder?.endsWith("*")) {
		component.placeholder = placeholder.slice(0, -1);
		component.required = true;
	}

	if (placeholder && !label) {
			// set this key to null so that no element will be created for it
		component.label = null;
	}

	if (typeof component.required === "boolean") {
		component.validate = {
			...(component.validate ?? {}),
			required: component.required,
		};
		delete component.required;
	}

	if (components) {
			// use flatMap in case the component returns an array
		component.components = components.flatMap((comp) => processComponent(comp, context));
	}

	if (columns) {
			// each column has its own components that need to be processed
		columns.forEach((col) => col.components =
 			col.components.map((comp) => processComponent(comp, context)));
	}

	return component;
}
