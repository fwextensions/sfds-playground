import { panelGroup } from "./panelGroup.js";

const TableInputTrue = {
	tableView: true,
	input: true,
};
const TableInputFalse = {
	tableView: false,
	input: false,
};
const ComponentProperties = [
	["panel", {
		collapsible: false,
	}],
	["textfield"],
	["email", {
		validateOn: "blur",
	}],
	["phoneNumber", {
		inputMask: "999-999-9999",
		validateOn: "blur",
	}],
	["number", {
		delimiter: false,
		requireDecimal: false,
		inputFormat: "plain",
		truncateMultipleSpaces: false,
		validateOn: "blur",
	}],
	["checkbox"],
	["radio"],
	["day", {
		hideInputLabels: true,
		fields: {
			day: {
				placeholder: "Day",
				hide: false
			},
			month: {
				placeholder: "Month",
				hide: false
			},
			year: {
				placeholder: "Year",
				hide: false
			}
		},
	}],
	["button"],
	["selectboxes", {
		inputType: "checkbox",
	}],
	["select", {
		widget: "html5",
		searchEnabled: false,
	}],
	["fieldSet",
		TableInputFalse
	],
	["editgrid",
		TableInputFalse
	],
	["htmlelement", {
			// since we allow just the tag key to be included, make sure the actual
			// type is specified as well
		type: "htmlelement",
		...TableInputFalse,
	}],
	["columns",
		TableInputFalse
	],
];
const ComponentDefaults = ComponentProperties.reduce((result, [key, props]) => ({
	...result,
	[key]: {
		...TableInputTrue,
		...props
	},
}), {
		// we don't want to add any defaults to the form, but we do want it in this
		// hash so its components array gets handled in processComponent() below
	form: {},
	panelGroup: {}
});

export function processComponent(
	data,
	context)
{
	const { type, key, label, placeholder, components, columns } = data;
	const { uniqueKey } = context;
	const defaults = ComponentDefaults[type || (data.tag && "htmlelement")];

	if (!defaults) {
		throw new Error(`Unknown component type: ${type}`);
	}

	const component = {
		...defaults,
		...data,
	};

	if (type === "panelGroup") {
		return panelGroup(component, context);
	} else if (type !== "form") {
		component.key = uniqueKey(key || label || placeholder || component.title || component.tag);
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
