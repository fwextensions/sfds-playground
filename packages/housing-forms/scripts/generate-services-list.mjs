import { stringify } from "yaml";
import clipboard from "clipboardy";

const text = `
foodAccess\tNon-housing basic needs\ton-site programs and services that ensure access to food\tworld kitchen, senior meals on wheels, CalFresh application
utilityAssistance\tNon-housing basic needs\ton-site programs and services that address utility financial assistance\tMonthly stipend, CARE, FERA
transportSupport\tNon-housing basic needs\ton-site programs and services that address transportation needs\tGoGoGrandparent, Clipper Card Assistance, Muni Tokens for Residents, On-site shuttle/Paratransit
basicNeedsSupport\tNon-housing basic needs\ton-site programs and services that address non-housing basic needs\tHousekeeping, Annual Dump Day
socialEventsCommunity\tCommunity Building\ton-site social events and gatherings that promote community-building\tKwanzaa dinner, Knitting Korner, Puzzles and pizza
exerciseGroupClasses\tCommunity Building\ton-site group exercise classes\tChair yoga, Walking group, Zumba
enrichmentLearning\tCommunity Building\ton-site enrichment classes\tLearn to garden, Walking history tour of SOMA
communityProgramming\tCommunity Building\ton-site community-building programming\t
educationalServices\tTraining and Education\ton-site educational services\tGED classes, ESL classes
lifeSkillsTraining\tTraining and Education\ton-site life-skills training\tLearn the Web
jobSupportTraining\tTraining and Education\ton-site employment assistance and job trainings\tJob placement and support, Resume assistance
individualCaseManagement\tService coordination and linkages\ton-site individual case management\t
mentalHealthServices\tService coordination and linkages\ton-site mental health services\t
outpatientCare\tService coordination and linkages\ton-site outpatient services\t
substanceAbuseSupport\tService coordination and linkages\ton-site substance abuse services\t
serviceCoordinationOther\tService coordination and linkages\tother on-site service coordination and linkages\t
otherUnlistedServices\tOther services\tother on-site services, not listed above\t
`;
const rows = text.split("\n")
	.filter(Boolean)
	.map(row => row.split("\t"));
const components = [];
let fieldSet;

for (const row of rows) {
	const [key, section, name, examples] = row;
	const serviceOffering = {
		type: "serviceOffering",
		key,
		name,
	};

	if (examples) {
		serviceOffering.examples = examples;
	}

	if (section !== fieldSet?.legend) {
		if (fieldSet) {
			components.push(fieldSet);
		}

		fieldSet = {
			type: "fieldset",
			legend: section,
			description: "this is a description",
			components: [],
		};
	}

	fieldSet.components.push(serviceOffering);
}

components.push(fieldSet);

clipboard.writeSync(stringify({ components }));
