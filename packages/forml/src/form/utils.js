export function clone(
	obj)
{
	return JSON.parse(JSON.stringify(obj));
}

const isNode = typeof process !== "undefined" && process.versions?.node;
const isBrowser = typeof window !== "undefined";
const cache = new Map();

export async function loadYaml(filePath)
{
	// Check cache first
	if (cache.has(filePath)) {
		return cache.get(filePath);
	}

	let result;

	if (isBrowser || !isNode) {
		// Browser/Vite environment - import dynamically but with known paths
		// Vite can still analyze these because they're string literals
		const moduleLoaders = {
			"address.yaml": () => import("./address.yaml"),
			"serviceOffering.yaml": () => import("./serviceOffering.yaml"),
			// Add other YAML files as needed
		};
		const loader = moduleLoaders[filePath];

		if (!loader) {
			throw new Error(
				`YAML file ${filePath} not configured for browser loading. Available files: ${Object.keys(moduleLoaders).join(
					", ")}`);
		}

		const module = await loader();

		result = module.default;
	} else {
		// Node.js environment
		const [{ default: yaml }, { readFile }] = await Promise.all([
			import("yaml"),
			import("node:fs/promises")
		]);
		const content = await readFile(new URL(filePath, import.meta.url), "utf-8");

		result = yaml.parse(content);
	}

	// Cache the result
	cache.set(filePath, result);

	return result;
}
