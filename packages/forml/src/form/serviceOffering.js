import { processComponent } from "./processComponent.js";
import { createUniqueKeyFn } from "./string.js";
import { clone, loadYaml } from "./utils.js";

const skeleton = await loadYaml("serviceOffering.yaml");
const unduplicatedCount = await loadYaml("serviceUnduplicatedCount.yaml");

const description = (examples) => examples ? `e.g. ${examples}` : "";
const nameCase = (name) => name[0].toUpperCase() + name.slice(1);
const label = (name, desc) => "<h5>" + name[0].toUpperCase() + name.slice(1) + "</h5>" +
	(desc ? ` <div class="fg-light-slate">(${description(desc)})</div>` : "");

export function serviceOffering(
	data,
	context)
{
	const { uniqueKey } = context;
	const { name, examples, key = uniqueKey(name.split(/\W+/).slice(-5).join(" ")) } = data;
	const serviceSetting = clone(skeleton);
	const [radio, columns] = serviceSetting.components;

	serviceSetting.key = key;
	radio.label = nameCase(name);
	radio.description = description(examples);
	columns.key = key + ".columns";
	columns.conditional.when = key + ".offered";

	if (context.unduplicatedCount) {
			// use a different set of controls for an offering inside a section with
			// an unduplicated count
		columns.columns[0].components = clone(unduplicatedCount).components;
	}

		// we don't want the keys in the container to be uniquified because they'll
		// be accessed via the container key, so the path will be unique
	return processComponent(serviceSetting, { uniqueKey: createUniqueKeyFn() });
}
