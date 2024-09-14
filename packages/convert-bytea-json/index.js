const fs = require("fs").promises;
const path = require("path");

async function byteaToFile(
	byteaString,
	outputFilePath)
{
	const cleanByteaString = byteaString.startsWith("\\x")
		? byteaString.slice(2)
		: byteaString;

	const buffer = Buffer.from(cleanByteaString, "hex");
	await fs.writeFile(outputFilePath, buffer);
	console.log(`File written successfully to ${outputFilePath}`);
}

async function processJsonFile(
	jsonFilePath,
	outputDir)
{
	try {
		// Read and parse the JSON file
		const jsonData = await fs.readFile(jsonFilePath, "utf8");
		const { values } = JSON.parse(jsonData);

		for (const value of values) {
			const [listingID, filename, type, data] = value;
			const extension = type.split("/")[1];
			const listingDir = path.join(outputDir, listingID);
			const outputFilePath = path.join(listingDir, `${filename}.${extension}`);

			// Ensure the listing directory exists
			await fs.mkdir(listingDir, { recursive: true });
			await byteaToFile(data, outputFilePath);
		}

		console.log("All files processed successfully.");
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

// Get the JSON file path from command line arguments
const jsonFilePath = process.argv[2];
const outputDir = process.argv[3] || "output";

if (!jsonFilePath) {
	console.error("Please provide the path to the JSON file as a command line argument.");
	process.exit(1);
}

(async () => await processJsonFile(jsonFilePath, outputDir))();
