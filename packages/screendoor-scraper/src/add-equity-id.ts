import fs from "fs-extra";

const data = fs.readJsonSync("ea.json");
const verified = data.filter(({ labels }) => labels.includes("Verified"));
const csv = fs.readFileSync("ea.csv", "utf8");
const [header, ...rows] = csv
	.replace(/(\"[^"]+\")/g, (substring) => substring.replace(/[",]/g, ""))
	.split("\n")
	.filter(row => row)
	.map(row => row.split(","));

const verifiedByEmail = {};
const verifiedByName = {};

verified.forEach((item) => {
	const { id, responses } = item;
	const { olx6oghz: firstName, "08684bq8": lastName, ofmtxo30: email } = responses;

//	const email = responses.ofmtxo30.toLowerCase();

	verifiedByEmail[email.toLowerCase()] = id;
	verifiedByName[((firstName + lastName).replace(/\W/g, "")).toLowerCase()] = id;
});

console.log(verifiedByEmail);
//console.log(verifiedByName);
//const verifiedByEmail = verified.reduce((result, item) => ({
//	...result,
//	[item.responses.ofmtxo30.toLowerCase()]: item.id
//}));

console.log(verified.length);
console.log(rows.length);

header.unshift("Response ID");
rows.forEach((row) => {
	const name = row[0].replace(/\W/g, "").toLowerCase();
	const email = row[2].toLowerCase();
	const id = verifiedByEmail[email] || verifiedByName[name] || "";

	if (!id) {
		console.log(email, name);
	}

	row.unshift(id);
});

const output = [header.join(","), ...rows.map(row => row.join(","))].join("\n");

fs.writeFileSync("out.csv", output);
