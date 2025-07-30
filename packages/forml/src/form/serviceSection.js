import { processComponent } from "./processComponent.js";

export function serviceSection(
	data,
	context)
{
	const component = {
		type: "fieldset",
		legend: data.legend,
		customClass: "service-section",
		components: [
			{
				type: "htmlelement",
				tag: "blockquote",
				content: data.description
			},
			...data.components
		]
	};

	context.unduplicatedCount = data.unduplicatedCount;

	const processed = processComponent(component, context);

	delete context.unduplicatedCount;

	return processed;
//	return processComponent(component, context);
}
