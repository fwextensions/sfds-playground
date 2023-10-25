{

	// "import" these utilities from the functions at the end of this script
const { GroupedArray, DefaultMap, getCellObject, getFieldsByName, getRecordObjects, loopChunks, confirm, clearTable, parseDate, by, chain } = utils();
const { getProjectStatusFields } = status();
const { values, entries, fromEntries } = Object;

const Basename = "Cannabis Business Permit";
const ScreendoorTableName = "SCREENDOOR_BUSINESS_PERMIT";
const ScreendoorRevTableName = ScreendoorTableName + "_REV";
const ScreendoorFields = [
	"RESPONSE_ID",
	"RESPONSE_NUM",
	"INITIAL_RESPONSE_ID",
	"ARCHIVED_ID",
	"RESPONSE_JSON",
	"AIRTABLE_JSON",
	"AIRTABLE_JSON_BO",
	"SUBMITTED_AT",
	"SCREENDOOR_FORM_ID",
];
const SubmissionFields = {
	ID: "RESPONSE_ID",
	Num: "RESPONSE_NUM",
	SubmissionID: "SUBMISSION_ID",
	ProjectID: "PROJECT_ID",
	Submitted: "Submitted",
	Email: "email",
};
const InitialID = "Initial Screendoor Response ID";
const ReviewsTableName = Basename + " Reviews";
const ReviewFields = {
	MostRecent: "Initial Application - Latest Submission",
	Previous: "Initial Application - Previous Submissions",
	SubmissionID: "Initial Application Submission ID",
	InitialID: "Initial Response ID",
	ResponseNum: "Initial Application Screendoor Number",
	OriginalDate: "Project Submission Date",
	Status: "Project Status",
};
const Forms = [
	["4209", "Temporary Permit"],
	["4225", "Article 33"],
	["4279", "Pre-inspection"],
	["4717", "Equity Application", "ea"],
	["6799", "Event Permit", "ea"],
	["5804", "Initial Application", "biz", "IA"],
	["5804BO", "Business Ownership", "biz", "BO"],
	["5885", "Community Outreach", "biz", "CO"],
	["6447", "General Operations", "biz", "GO"],
	["5886", "General Operations", "biz", "GO"],
	["5887", "Security Plan", "biz", "Sec"],
	["6162", "General Operations", "biz", "GO"],
	["6419", "Storefront Retail", "biz", "SR"],
	["6425", "Distributor", "biz", "Dis"],
	["6437", "Cultivation", "biz", "Cult"],
	["6420", "Delivery", "biz", "Del"],
	["6428", "Manufacturing", "biz", "Mfg"],
	["6431", "Testing", "biz", "Test"],
	["6682", "Legal Help"],
	["8110", "Renewal", "ren", "Ren1"],
	["9026", "Renewal", "ren", "Ren2"],
	["9436", "Renewal", "ren", "Ren3"]
].reduce((result, [id, name, base, shortName]) => {
	const info = { id, name, base, shortName };

	result[id] = result[name] = info;
	shortName && (result[shortName] = info);

	return result;
}, {
	info(base)
	{
		const baseString = base === "part2" ? "biz" : base;
		let info = values(this)
			.filter((form) => form.base === baseString);

		if (base === "part2") {
				// treat IA as part 1, and everything else, including BO, as part 2
			info = info.filter(({ name }) => name !== this.IA.name);
		}

		return info;
	},

	names(base)
	{
			// make sure the names are unique
		return [...new Set(this.info(base).map(({ name }) => name))];
	},
});
const MetadataTableName = "Screendoor Metadata";
const MetadataTableFields = [
	{
		name: "Activity Date",
		key: "timestamp",
		type: "dateTime",
		options: {
			dateFormat: {
				name: "us"
			},
			timeFormat: {
				name: "12hour"
			},
			timeZone: "America/Los_Angeles"
		}
	},
	{
		name: "Activity",
		key: "event",
		type: "richText",
	},
	{
		name: "Message",
		key: "message",
		type: "richText",
	},
	{
		name: "Response ID",
		key: "responseID",
		type: "number",
		options: {
			precision: 0
		},
	},
	{
		name: "Response Number",
		key: "responseNumber",
		type: "string",
		options: {
			precision: 0
		},
	},
	{
		name: "Permit Reviews Metadata",
		key: "",
		type: "multipleRecordLinks",
		options: {
				// we'll set this below after the user chooses a reviews table
			linkedTableId: null
		}
	},
];
const StringFieldTypes = [
	"singleLineText",
	"multilineText",
	"richText",
	"email",
	"phoneNumber",
	"url",
];
const ActivityTableName = "Activity History";
//const ApprovalPattern = /(approved .+ edits|submitted edits for review\.)/;
//const ApprovalPattern = /(approved .+ edits|edited the response\.|submitted edits for review\.)/;
const ApprovalPattern = /(approved .+ edits|edited the response\.)/;
// TODO: also match `changed the status to **Submitted**`?

const submissionsTablesByFormID = fromEntries(Forms.info("biz")
	.map(({ id, name }) => [id, base.getTable(name + " Submissions")]));
const context = {
  submissionsTablesByFormID,
  submissionsTableMetadataByFormID: fromEntries(entries(submissionsTablesByFormID)
		.map(([formID, table]) => [formID, getFieldsByName(table)])),
  submissionsTables: [...new Set(values(submissionsTablesByFormID))],
  reviewsTable: base.getTable(ReviewsTableName),
  metadataTable: base.getTable(MetadataTableName)
};
const startTime = Date.now();

output.markdown(`Starting at **${new Date().toLocaleString()}**`);

const result = await chain(
	context,
	[
		createApprovalMetadataFromJSONFile,
		clearExistingRecords,
		convertScreendoorDataToAirtableData,
		console.log,
//		groupSubmissionsByFormAndInitialID,
		createSubmissions,
		console.log,
		createReviewData,
		console.log,
		createReviewRecords,
		updateSubmissionsWithProjectID,
		console.log,
		createMetadataRecords,
//		connectMetadataRecords,
	]
);

console.log(result);

output.markdown(`Total time: **${((Date.now() - startTime) / 1000).toFixed(2)}s** at **${new Date().toLocaleString()}**`);

// ====================================================================================================================
// import metadata from JSON file
// ====================================================================================================================

async function createApprovalMetadataFromJSONFile(
	context)
{
	const jsonFile = await input.fileAsync(
		"Choose a .json file containing Screendoor metadata:",
		{
			allowedFileTypes: [".json", "application/json"],
		}
	);

		// sort metadata newest to oldest, which is how we want the events to appear in the interface
	const metadataItems = jsonFile.parsedContents.sort(by("timestamp", true));
	const approvalMetadataByInitialIDByFormID = new DefaultMap(GroupedArray);

	for (const item of metadataItems) {
		const { responseID, initialID, formID, event } = item;

		if (ApprovalPattern.test(event)) {
			approvalMetadataByInitialIDByFormID.get(formID).push(initialID ?? responseID, item);
		}
	}

	return {
		...context,
		metadataItems,
		approvalMetadataByInitialIDByFormID,
	};
}

// ====================================================================================================================
// clear existing records in all tables
// ====================================================================================================================

async function clearExistingRecords(
	context)
{
	const { submissionsTables, reviewsTable, metadataTable } = context;

	if (!await confirm("Clear the submissions, reviews, and metadata tables?")) {
			// return true to stop the chain
		return true;
	}

// TODO: don't delete records that have RESPONSE_NUM >= 10000, which are test records
//  add a filter param to clearTable
		// clear all of the submission tables
	await Promise.all(submissionsTables.map((table) => clearTable(table)));
	await clearTable(reviewsTable);
	await clearTable(metadataTable);
	await clearTable(base.getTable(ActivityTableName));
}

// ====================================================================================================================
// convert AIRTABLE_JSON fields to Airtable record data
// ====================================================================================================================

async function convertScreendoorDataToAirtableData(
	context)
{
	const { submissionsTableMetadataByFormID } = context;
	const screendoorTable = base.getTable(ScreendoorTableName);
	const screendoorRevTable = base.getTable(ScreendoorRevTableName);
	const airtableDataByInitialIDByFormID = new DefaultMap(GroupedArray);
	const iaStatusInfoByInitialID = {};
	const fieldNameMappings = getNameMappings();
	const allowedFormIDs = Forms.info("biz").map(({ id }) => id);

	function getSelectFromName(
		name)
	{
			// don't convert falsy, non-zero values to a name object; just return null instead, which is a valid option
		return name || name === 0
			? { name }
			: null;
	}

	function getDataFromJSON(
		json,
		fieldMetadata,
		overrides = {})
	{
		let data = json;

		if (typeof json === "string") {
			try {
				data = JSON.parse(json);
			} catch (e) {
					// in case the JOSN field was accidentally edited, log the string so we can find it
				console.error(json);
				throw e;
			}
		}

		entries(data).forEach(([key, value]) => {
			const mappedKey = fieldNameMappings[key];

			if (mappedKey) {
					// this JSON is using an old Airtable field name, so map it to the new one
				data[mappedKey] = data[key];
				delete data[key];

					// use the updated key for the rest of this loop, so that we'll check the remapped value in fieldMetadata
				key = mappedKey;
			}

			if (!(key in fieldMetadata)) {
				console.error(`Unknown key: ${key} ${data.RESPONSE_NUM} ${data.email}`);
// TODO: this should probably throw to stop the processing instead of skipping a key and losing the data

				return;
			} else if (key === "SCREENDOOR_BUSINESS_PERMIT") {
					// some tables have this field, and some don't, but none of them seem to need it, so just delete it so that
					// it doesn't cause any errors
				delete data[key];

				return;
			}

			const { type, choices } = fieldMetadata[key];

				// the JSON is coming in with bare strings for select choices, so fix those.  also check that the selected options
				// exist in the field, and throw if not.
			if (type === "singleSelect") {
				if (value && choices && !choices.includes(value)) {
					console.error(data);
					throw new Error(`Unknown option for single-select field "${key}": "${value}"`);
				}

				data[key] = getSelectFromName(value);
			} else if (type === "multipleSelects" && value) {
					// the value for a multipleSelects needs to be in an array, and not all form mappings seem to provide that,
					// so make sure it's wrapped (but only if it's not null)
				const valueArray = [].concat(value);

				if (choices && !valueArray.every(name => !name || choices.includes(name))) {
					const unknownOptions = valueArray.filter((name) => !choices.includes(name));

					console.error(data);
					throw new Error(`Unknown option for multi-select field "${key}": "${unknownOptions}"`);
				}

					// make sure that the array of values is unique, since Airtable will complain otherwise
				data[key] = [...new Set(valueArray)].map((name) => getSelectFromName(name));
			} else if (type === "multipleRecordLinks") {
				data[key] = value.map((id) => ({ id }));
			} else if (StringFieldTypes.includes(type)) {
					// extra spaces at the beginning or end of some fields can cause issues, so trim them
				data[key] = value == undefined
					? ""
					: String(value).trim();
			}
		});

		return {
			...data,
			...overrides,
		};
	}

	(await getRecordObjects(screendoorRevTable, ScreendoorFields))
			// confusingly, we have to sort the revisions by the SUBMITTED_AT field in the REV table *before* adding in the
			// unsorted submission records.  this is because the submissions will have a SUBMITTED_AT date from the original
			// submission time, even though the most recent submission time is more recent (if there are revisions), and we'll
			// need to get that most recent time from the metadata.  at this point, we don't have a reliable timestamp that
			// will guarantee the most recent submission will come last if we sort by it, so that's why we just append the
			// submissions after the sorted revisions.
		.sort(by("SUBMITTED_AT"))
		.concat(await getRecordObjects(screendoorTable, ScreendoorFields))
		// make sure we're not including rogue 9396 forms, as well as all the revisions with null JSON
		.filter(({ AIRTABLE_JSON, SCREENDOOR_FORM_ID }) => AIRTABLE_JSON && allowedFormIDs.includes(SCREENDOOR_FORM_ID))
//.filter(({ RESPONSE_ID }) => RESPONSE_ID > 3840000)
		.forEach(({
			RESPONSE_ID,
			RESPONSE_NUM,
			INITIAL_RESPONSE_ID,
			ARCHIVED_ID,
			RESPONSE_JSON,
			AIRTABLE_JSON,
			AIRTABLE_JSON_BO,
			SCREENDOOR_FORM_ID: formID
		}) => {
			const initialID = INITIAL_RESPONSE_ID ?? RESPONSE_ID;
			const tableMetadata = submissionsTableMetadataByFormID[formID];
			const overrides = {
					// this key is in the Airtable JSON, but for the revisions, it's not the ID of the original submission; it's some
					// other, unrelated ID.  but we need the original response ID to link the revisions to the originals.  so overwrite
					// the RESPONSE_ID field in the Airtable data with the one from Screendoor.  the revisions also won't have the
					// sequential_id in the JSON, so take it from the RESPONSE_NUM field in the record and make sure it's a string,
					// since that's what submission tables expect.
				RESPONSE_ID: initialID,
				RESPONSE_NUM: String(RESPONSE_NUM),
					// we want to give current submissions a blank SUBMISSION_ID, but a 0 to revisions.  this makes it possible
					// to distinguish them when generating Form.io records.  ARCHIVED_ID is only set on revisions.
				SUBMISSION_ID: ARCHIVED_ID ? "0" : "",
			};

			if (formID === Forms.IA.id) {
				const { status, labels } = JSON.parse(RESPONSE_JSON);

					// the last submission to store its status and labels should be the most recent submission, since we sorted
					// the revisions before the submissions above
				iaStatusInfoByInitialID[initialID] = [status, labels];
			}

			airtableDataByInitialIDByFormID.get(formID).push(initialID,
				getDataFromJSON(AIRTABLE_JSON, tableMetadata, overrides));

			if (AIRTABLE_JSON_BO) {
					// 5804 records return the Initial Application data in the AIRTABLE_JSON field and have another JSON field
					// for the data that was separated out into the Business Ownership form
				const boFormID = Forms.BO.id;
				const tableMetadata = submissionsTableMetadataByFormID[boFormID];
					// we want to add the count of this array in the Screendoor JSON to the BO submission
				const { responses: { wj1tb99y: screendoorBizOwners } } = JSON.parse(RESPONSE_JSON);

				if (Array.isArray(screendoorBizOwners)) {
						// the Form.io form can only show up to 5 business owners, so limit the count
					overrides.bizOwnerNumber = Math.min(screendoorBizOwners.length, 5);
				}

				airtableDataByInitialIDByFormID.get(boFormID).push(initialID,
					getDataFromJSON(AIRTABLE_JSON_BO, tableMetadata, overrides));
			}
		});

	return {
		...context,
		iaStatusInfoByInitialID,
		airtableDataByInitialIDByFormID,
	};
}

// ====================================================================================================================
// group submissions by form
// ====================================================================================================================

async function groupSubmissionsByFormAndInitialID(
	context)
{
	const { submissionsTables } = context;
	const { ID, ProjectID } = SubmissionFields;
	const submissionRecordIDsByResponseByFormID = {};

	for (const table of submissionsTables) {
			// the IA table doesn't currently have the InitialID field, so start with the other fields and then add InitialID
			// if it's in the table, since Airtable throws if you try to get a field that doesn't exist.  ffs.
		const fields = [ID, ProjectID]
			.concat(table.fields.some(({ name }) => name === InitialID) ? InitialID : []);
		const records = (await getRecordObjects(table, fields))
			.filter(({ RESPONSE_ID }) => RESPONSE_ID);
		const formName = table.name.replace(" Submissions", "");
		const recordIDsByResponse = new GroupedArray();

		records.forEach((record) => {
			recordIDsByResponse.push(record[InitialID] || record[ID], { id: record._id });
		});
		submissionRecordIDsByResponseByFormID[Forms[formName].id] = recordIDsByResponse;
	}

	context.submissionRecordIDsByResponseByFormID = submissionRecordIDsByResponseByFormID;
}

// ====================================================================================================================
// create Initial Application submissions
// ====================================================================================================================

async function createSubmissions(
	context)
{
	const {
		airtableDataByInitialIDByFormID,
		approvalMetadataByInitialIDByFormID,
	} = context;
	const submissionRecordIDsByResponseByFormID = {};

	for (const [formID, airtableDataByInitialID] of airtableDataByInitialIDByFormID.entries()) {
			// the IA and BO forms share the same metadata, but it's been stored under 5804.  so use that form ID to look up
			// the metadata in the special BO case.
		const metadataFormID = formID === Forms.BO.id ? Forms.IA.id : formID;
		const approvalMetadataByInitialID = approvalMetadataByInitialIDByFormID.get(metadataFormID);
		const submissions = [];
// TODO: solve The Case of the Missing Metadata
const missingMetadata = [];
console.log("form", formID, "approvalMetadataByInitialID", approvalMetadataByInitialID);

		airtableDataByInitialID.forEach((initialID, items) => {
			const [firstSubmission, ...rest] = items;

			submissions.push({ fields: firstSubmission });

			if (rest.length) {
				if (!approvalMetadataByInitialID.has(initialID)) {
//				console.log(`No approval metadata for response ${initialID} in form ${formID}.`, firstSubmission, rest);
missingMetadata.push([formID, initialID, firstSubmission, rest]);
//return;
//				throw new Error(`No metadata for response ${initialID} in form ${formID}.`);
				} else {
					const newestSubmittedDate = approvalMetadataByInitialID.get(initialID)[0];

						// when there are revisions, the submission date of the "current" submission is not included in the JSON, so we
						// have to pull it from the metadata.  the most recent metadata date is when the current submission was approved.
					rest.at(-1).Submitted = newestSubmittedDate.timestamp;
				}

					// store each of the submissions on a fields key so it's ready to be used to create a new record
				submissions.push(...(rest.map((fields) => ({ fields }))));
			}
		});

			// we now need to sort the submissions in descending order so that the first record in each GroupedArray value will
			// be the most recent submission when we store it in the loopChunks() below.  that way, it'll be the latestID that we
			// use to get the latest submission when creating the review record in the for loop below.  we have to dig into the
			// fields to get the date, and then call parseDate(), because the format isn't quite parseable with new Date().
		submissions.sort(by(({ fields: { Submitted } }) => Submitted, true));

		const recordIDsByResponse = new GroupedArray();
		const submissionsTable = submissionsTablesByFormID[formID];

		output.markdown(`Starting import of **${submissions.length}** submissions for **${Forms[formID].name}**...`);

missingMetadata.length && console.error(`missingMetadata: ${missingMetadata.length}, total: ${airtableDataByInitialID.keys().length}`, missingMetadata);

console.log(formID, submissions);

		await loopChunks(submissions, async (chunk) => {
			const records = await submissionsTable.createRecordsAsync(chunk);

			chunk.forEach((submission, i) => {
				const { fields: { [SubmissionFields.ID]: responseID } } = submission;

				recordIDsByResponse.push(responseID, { id: records[i] });
			});
		});

		submissionRecordIDsByResponseByFormID[formID] = recordIDsByResponse;
	}

	context.submissionRecordIDsByResponseByFormID = submissionRecordIDsByResponseByFormID;
}

// ====================================================================================================================
// create reviews from Initial Application submissions
// ====================================================================================================================

async function createReviewData(
	context)
{
	const { submissionRecordIDsByResponseByFormID, iaStatusInfoByInitialID } = context;
	const iaRecordIDs = submissionRecordIDsByResponseByFormID[Forms.IA.id].values();
	const reviews = [];

	output.markdown(`Constructing ${iaRecordIDs.length} reviews...`);

	function normalizeLink(
		record)
	{
		// linked records need to be wrapped in an array, unless the list is empty/null
		if (Array.isArray(record)) {
			return record.length ? record : null;
		} else {
			return record ? [record] : null;
		}
	}

		// create a review for each of the Initial Application submissions
	for (const [latestRecordID, ...previousRecordIDs] of iaRecordIDs) {
		const submissionsTable = submissionsTablesByFormID[Forms.IA.id];
			// get the created record for the most recent submission, so we can get any fields set by formulas
			// that we need to use when generating the review data below
		const latestRecord = await submissionsTable.selectRecordAsync(latestRecordID.id);
		const latest = getCellObject(latestRecord, values(SubmissionFields));
		const responseID = latest[SubmissionFields.ID];
			// link to all of the part 2 submissions related to this review
		const linkFields = Forms.info("part2")
			.reduce((result, { name, id }) => {
					// if we got no submissions at all for a form, this could be undefined
				const [latest, ...previous] = submissionRecordIDsByResponseByFormID[id]?.get(responseID) || [];

				result[`${name} - Latest Submission`] = normalizeLink(latest);
				result[`${name} - Previous Submissions`] = normalizeLink(previous);

				return result;
			}, {});
		const statusFields = getProjectStatusFields(...iaStatusInfoByInitialID[responseID]);
		let originalSubmittedDate = latest[SubmissionFields.Submitted];

		if (previousRecordIDs.length) {
				// with more than one record, the original submission date is from the oldest record, which is last in this array
			const oldestRecord = await submissionsTable.selectRecordAsync(previousRecordIDs.at(-1).id);
			const oldest = getCellObject(oldestRecord, values(SubmissionFields));

			originalSubmittedDate = oldest[SubmissionFields.Submitted];
		}

		reviews.push({
			fields: {
				[ReviewFields.SubmissionID]: latest[SubmissionFields.SubmissionID],
				[ReviewFields.InitialID]: responseID,
				[ReviewFields.ResponseNum]: latest[SubmissionFields.Num],
				[ReviewFields.OriginalDate]: parseDate(originalSubmittedDate).toISOString(),
				[ReviewFields.MostRecent]: normalizeLink(latestRecordID),
				[ReviewFields.Previous]: normalizeLink(previousRecordIDs),
				...linkFields,
				...statusFields,
			}
		});
	}

	context.reviews = reviews;
}

// ====================================================================================================================
// create review records
// ====================================================================================================================

async function createReviewRecords(
	context)
{
	const { reviews, reviewsTable } = context;
	const reviewRecordsByInitialID = {};

	output.markdown(`Creating ${reviews.length} review records...`);

	await loopChunks(reviews, async (chunk) => {
		const records = await reviewsTable.createRecordsAsync(chunk);

		chunk.forEach((review, i) => {
			const { fields: { [ReviewFields.InitialID]: initialID } } = review;

			reviewRecordsByInitialID[initialID] = { id: records[i] };
		});
	});

	context.reviewRecordsByInitialID = reviewRecordsByInitialID;
}

// ====================================================================================================================
// update submissions with associated Project ID
// ====================================================================================================================

async function updateSubmissionsWithProjectID(
	context)
{
	const { reviewsTable, submissionRecordIDsByResponseByFormID, reviewRecordsByInitialID } = context;

	for (const [formID, submissionRecordIDsByResponse] of entries(submissionRecordIDsByResponseByFormID)) {
		const updatedSubmissions = [];

		for (const [initialID, reviewRecordID] of entries(reviewRecordsByInitialID)) {
			const record = await reviewsTable.selectRecordAsync(reviewRecordID.id);
			const projectID = record.getCellValue("Project ID");
			const fields = {
					// the Project ID on the review is a number, but the PROJECT_ID field on the submissions is a string.  ffs.
				[SubmissionFields.ProjectID]: String(projectID)
			};
			const submissionRecords = submissionRecordIDsByResponse.get(initialID);

			if (submissionRecords) {
				submissionRecords.forEach(({ id }) => updatedSubmissions.push({ id, fields }));
			}
		}

		if (updatedSubmissions.length) {
			output.markdown(`Updating "${Forms[formID].name}" submissions with Project IDs...`);

			await loopChunks(updatedSubmissions, async (chunk) => submissionsTablesByFormID[formID].updateRecordsAsync(chunk));
		}
	}
}

// ====================================================================================================================
// create metadata items associated with the reviews we created above
// ====================================================================================================================

async function createMetadataRecords(
	context)
{
	const { metadataTable, metadataItems, reviewRecordsByInitialID } = context;
	const metadataRecords = [];
	const skippedNumbers = new Set();

	for (const item of metadataItems) {
		const initialID = item.initialID ?? item.responseID;
		const reviewRecord = reviewRecordsByInitialID[initialID];

			// ignore metadata for any rogue forms that got scraped
		if (reviewRecord && Forms[item.formID]) {
			const fields = MetadataTableFields.reduce((result, { name, key }) => ({
				...result,
				[name]: key
					? item[key]
						// the linked record field has an empty key value, since it doesn't exist in the JSON,
						// and must be wrapped in an array
					: [reviewRecord]
			}), {});

				// this field is expecting a string, so convert the number
			fields["Response Number"] = String(fields["Response Number"]);
			fields["Response ID"] = initialID;
			fields["Form"] = { name: Forms[item.formID].name };
			metadataRecords.push({ fields });
		} else {
			skippedNumbers.add(initialID);
		}
	}

	if (skippedNumbers.size > 0) {
		output.markdown(`Skipping metadata response numbers with no matching reviews:\n\n${[...skippedNumbers].join(", ")}`);
	}

	output.markdown(`Starting metadata import...`);

	await loopChunks(metadataRecords, (chunk) => metadataTable.createRecordsAsync(chunk));
}

// ====================================================================================================================
// associate existing metadata items with the reviews
// ====================================================================================================================

async function connectMetadataRecords(
	context)
{
	const { metadataTable, reviewRecordsByInitialID } = context;
	const metadataRecords = (await getRecordObjects(metadataTable, ["Response ID", "Form"]));
	const skippedNumbers = new Set();
	const linkedFieldName = MetadataTableFields.at(-1).name;
	const updatedRecords = [];

	for (const record of metadataRecords) {
		const initialID = record["Response ID"];
		const reviewRecord = reviewRecordsByInitialID[initialID];

			// ignore metadata for any rogue forms that got scraped
		if (reviewRecord && Forms[record.Form]) {
			const { id } = reviewRecord;
			const fields = { [linkedFieldName]: [{ id }] };

			updatedRecords.push({ id: record._id, fields });
		} else {
			skippedNumbers.add(initialID);
		}
	}

	if (skippedNumbers.size > 0) {
		output.markdown(`Skipping metadata response numbers with no matching reviews:\n\n${[...skippedNumbers].join(", ")}`);
	}
console.log(updatedRecords);

	output.markdown(`Starting metadata linking...`);

	await loopChunks(updatedRecords, async (chunk) => metadataTable.updateRecordsAsync(chunk));
}

}

// ====================================================================================================================
// these reusable utility functions can be "imported" by destructuring the functions below
// ====================================================================================================================

function utils() {
	const MaxChunkSize = 50;

	class GroupedArray {
		constructor(
			initialData = {})
		{
			this.data = { ...initialData };
		}

		push(
			key,
			value)
		{
			const arr = this.data[key] || (this.data[key] = []);

			arr.push(value);
		}

		get(
			key)
		{
			return this.data[key];
		}

		getAll()
		{
			return this.data;
		}

		has(
			key)
		{
			return key in this.data;
		}

		keys()
		{
			return Object.keys(this.data);
		}

		values()
		{
			return Object.values(this.data);
		}

		entries()
		{
			return Object.entries(this.data);
		}

		forEach(
			iterator)
		{
			this.entries().forEach(([key, values]) => iterator(key, values));
		}

		map(
			iterator)
		{
			return this.entries().map(([key, values]) => iterator(key, values));
		}
	}

	class DefaultMap extends GroupedArray {
		constructor(
			defaultGenerator,
			initialData)
		{
			super(initialData);
			this.defaultGenerator = /^class\s/.test(String(defaultGenerator))
				? () => new defaultGenerator()
				: defaultGenerator;
		}

		get(
			key)
		{
			if (!(key in this.data)) {
				this.data[key] = this.defaultGenerator(key);
			}

			return this.data[key];
		}
	}

	class Progress {
		constructor({
			total,
			done = 0,
			printStep = 10 })
		{
			const startingPct = (done / total) * 100;

			this.total = total;
			this.done = done;
			this.printStep = printStep;
			this.lastPctStep = startingPct - (startingPct % printStep) + printStep;
			this.startTime = Date.now();

			if (this.done > 0) {
				output.markdown(`Starting at **${this.pctString()}%**.`);
			}
		}

		increment(
			progress)
		{
			this.done += progress;

			if (this.pct() >= this.lastPctStep) {
					// we've past another full step, so print the current progress and the total time in seconds
				output.markdown(`**${this.pctString()}%** done \\[${((Date.now() - this.startTime) / 1000).toFixed(2)}s\\]`);
				this.lastPctStep += this.printStep;
			}
		}

		pct()
		{
			return (this.done / this.total) * 100;
		}

		pctString()
		{
			return this.pct().toFixed(1);
		}
	}

	async function loopChunks(
		items,
		chunkSize,
		loopFn)
	{
		if (typeof chunkSize === "function") {
			loopFn = chunkSize;
			chunkSize = MaxChunkSize;
		}

		const updateProgress = new Progress({
			total: items.length,
			printStep: 10
		});

			// we don't have any try/catch around the loopFn because trying to catch errors and then log what they are just
			// prints `name: "j"`, which is obviously useless (and par for the course with Airtable).  so let the inner loop
			// fail, which will print a better error message.
		for (let i = 0, len = items.length; i < len; i += chunkSize) {
			const chunk = items.slice(i, i + chunkSize);
			const result = await loopFn(chunk, i);

			updateProgress.increment(chunk.length);

			if (result === true) {
					// return true to break out of the loop early
				return;
			}
		}
	}

	function getCell(
		record,
		fieldNames)
	{
		const names = [].concat(fieldNames);
		const result = names.map((name) => {
			let value = record.getCellValue(name);

			if (value && typeof value === "object") {
				value = record.getCellValueAsString(name);
			}

			return value;
		});

		return result.length > 1
			? result
			: result[0];
	}

	function getCellObject(
		record,
		fieldNames)
	{
		const result = [].concat(getCell(record, fieldNames));

		return Object.fromEntries([
			["_id", record.id],
			...result.map((value, i) => [fieldNames[i], value])
		]);
	}

	function getFieldsByName(
		table)
	{
		return table.fields.reduce((result, field) => {
			const { options } = field;

			if (options?.choices) {
					// extract the name strings from each choice so they're easier to access
				field.choices = options.choices.map(({ name }) => name);
			}

			result[field.name] = field;

			return result;
		}, {});
	}

	async function getRecords(
		table,
		fields = [])
	{
		return (await table.selectRecordsAsync({ fields	})).records;
	}

	async function getRecordObjects(
		table,
		fieldNames)
	{
		return (await getRecords(table, fieldNames))
			.map((record) => getCellObject(record, fieldNames));
	}

	async function clearTable(
		table)
	{
		const { records } = await table.selectRecordsAsync({ fields: [] });

		output.markdown(`Deleting **${records.length}** records in the **${table.name}** table.`);

		await loopChunks(records, MaxChunkSize, (chunk) => table.deleteRecordsAsync(chunk));
	}

	async function confirmClearTable(
		table)
	{
		const { records } = await table.selectRecordsAsync({ fields: [] });

		if (records.length) {
			const deleteAllowed = await input.buttonsAsync(`Clear the "${table.name}" table?`, ["Yes", "No"]);

			if (deleteAllowed !== "Yes") {
				return false;
			}

			await clearTable(table);
		}

		return true;
	}

	function parseDate(
		dateString)
	{
		let date = new Date(dateString);

		if (isNaN(date)) {
				// this is an Invalid Date, because the dateString wasn't parseable, so try to make it so
			date = new Date(dateString.replace(/([ap]m)/, " $1"));
		}

		return date;
	}

	function by(
		iteratee,
		descending)
	{
		const order = descending ? -1 : 1;

		return (a, b) => {
			const keyA = typeof iteratee === "function" ? iteratee(a) : a[iteratee];
			const keyB = typeof iteratee === "function" ? iteratee(b) : b[iteratee];
			let result;

			if (typeof keyA === "string" && typeof keyB === "string") {
				const valueA = keyA.toUpperCase();
				const valueB = keyB.toUpperCase();

				if (valueA < valueB) {
					result = -1;
				} else if (valueA > valueB) {
					result = 1;
				} else {
					result = 0;
				}
			} else {
				result = keyA - keyB;
			}

			return result * order;
		};
	}

	async function confirm(
		label,
		buttons = ["Yes", "No"])
	{
		const answer = await input.buttonsAsync(label, buttons);

		return answer === buttons[0];
	}

	const [timeStart, timeEnd] = (() => {
		const times = {};

		function timeStart(
			name = "timer")
		{
			times[name] = Date.now();
		}

		function timeEnd(
			name = "timer")
		{
			const startTime = times[name];

			if (startTime) {
				const totalTime = Date.now() - startTime;
				const totalTimeString = totalTime > 1000
					? (totalTime / 1000).toFixed(2) + "s"
					: totalTime + "ms";

				output.markdown(`**${name}** took **${totalTimeString}**.`);
				delete times[name];
			} else {
				output.markdown(`Timer called **${name}** not found.`);
			}
		}

		return [timeStart, timeEnd];
	})();

	async function chain(
		context,
		fns)
	{
		if (Array.isArray(context)) {
			fns = context;
			context = {};
		}

		for (const fn of fns) {
			if (typeof fn !== "function") {
				continue;
			} else if (fn === console.log) {
				console.log("current context:\n", context);
				continue;
			}

			timeStart(fn.name);

			const result = await fn(context);

			timeEnd(fn.name);

			if (result === true) {
				break;
			} else if (result && typeof result === "object") {
				context = result;
			}
		}

		return context;
	}

	return {
		GroupedArray,
		DefaultMap,
		Progress,
		loopChunks,
		getCell,
		getCellObject,
		getFieldsByName,
		getRecords,
		getRecordObjects,
		clearTable,
		confirmClearTable,
		parseDate,
		by,
		confirm,
		timeStart,
		timeEnd,
		chain,
	};
}

function status() {
	const ScreendoorToProjectStatus = {
		"Approved": "Approved",
		"Archived": "Archived",
		"Build-out": "Build-out",
		"Denied": "Denied",
		"Follow up Form - Not Reviewed": null,
		"Follow up Form - Reviewed": null,
		"On Hold": "On-Hold",
		"On Hold (Portability)": "On-Hold (portability)",
		"Parking Lot": "Parking Lot",
		"Processing": "Processing",
		"Submitted": "Submitted",
		"Submitted - pending initial OOC review": "Submitted-PIR",
		"Test Account": null,
		"Withdrawn": "Withdrawn"
	};
	const LabelToStatusFields = {
		"FUF - Reviewed, follow up needed": [null, null],
		"FUF - not reviewed yet": [null, null],
		"Fire - Approved": [null, null],
		"OOC - Approved to Occupy": [null, "Lease Approved"],
		"OOC(Conviction H.) - Approved": [null, null],
		"OOC(Land-Use) - sent for review": [null, null],
		"OOC(Plan Prelim) - Referred": [null, null],
		"Plan (Prelim) - Rejected, other reason": ["Rejected", null],
		"Plan(Land-Use) - Approved": ["Land Use Approved", null],
		"Plan(Prelim) - Need more info": ["More Info Needed", null],
		"Plan(Prelim) - Pre-existing approval in place": ["Pre-Existing Approval", null],
		"Plan(Prelim) - Rejected, improper zoning": ["Rejected", null],
		"Plan(Prelim) - Zoning Compliant, additional approval required": ["Zoning Compliant", null],
		"Police(Security) - Reviewed": [null, null]
	};

	function getProjectStatusFields(
		status,
		labels)
	{
		const fields = {};
		const projectStatus = ScreendoorToProjectStatus[status];

		projectStatus && (fields["Project Status"] = { name: projectStatus });

		labels?.forEach((label) => {
			const [informalZoningReview, proofToOccupy] = LabelToStatusFields[label] || [];

			informalZoningReview && (fields["Informal Zoning Review"] = { name: informalZoningReview });
			proofToOccupy && (fields["Proof to Occupy"] = { name: proofToOccupy });
		});

		return fields;
	}

	return {
		getProjectStatusFields
	};
}

function getNameMappings() {
	const mappings = {
		"Initial Application": `
firstName\tfirstName
lastName\tlastName
title\ttitle
email\temail
phoneNumber\tphoneNumber
authorizationToApply\tauthorizationToApply
equityID\tequityID
ownershipDocument.1.ownershipDocument1.{UPLOAD}.1\townershipDocument1
ownershipDocument.2.ownershipDocument1.{UPLOAD}.1\townershipDocument2
ownershipDocument.3.ownershipDocument1.{UPLOAD}.1\townershipDocument3
partneringWithIncubator\tpartneringWithIncubator
equityIncubatorName\tequityIncubatorName
equityIncubatorNumber\twhatIsYourEquityIncubatorNumber
equityAgreement.{UPLOAD}.1\tequityAgreement
affidavitNumber\taffidavitNumber
tempPermitNumber\ttempPermitNumber
complyUseActTemp\tcomplyUseActTemp
article33PermitNumber\tarticle33PermitNumber
complyUseActMCD\tcomplyUseActMCD
additionalContacts\tadditionalContacts
additionalContact.1.fullName\tadditionalContact1.fullName
additionalContact.1.email\tadditionalContact1.email
additionalContact.1.phone\tadditionalContact1.phone
additionalContact.2.fullName\tadditionalContact2.fullName
additionalContact.2.email\tadditionalContact2.email
additionalContact.2.phone\tadditionalContact2.phone
BAN\tBAN
OWNERS\tOWNERS
BusinessName\tBusinessName
DBAName\tDBAName
StreetAddress\tStreetAddress
City\tCity
State\tState
PostalCd\tPostalCd
LIN\tLIN
BusstartDate\tBusstartDate
BusEndDate\tBusEndDate
LocstartDate\tLocstartDate
LocEndDate\tLocEndDate
MailingAddress\tMailingAddress
MailCityStateZip\tMailCityStateZip
LocationNumber\tLocationNumber
OrgType\tOrgType
licclasscodes\tlicclasscodes
fyfind\tfyfind
pointlocation\tpointlocation
noLIN\tnoLIN
unverifiedAddress.street\tunverifiedAddress.street
unverifiedAddress.city\tunverifiedAddress.city
unverifiedAddress.state\tunverifiedAddress.state
unverifiedAddress.zip\tunverifiedAddress.zip
operationHours\thoursOfOperation
numberRetailLocations\tnumberOfRetailLocations
hasBPA\tbpa
bpaNumber\tbpaNumber
hasCUA\tcua
cuaNumber\tcuaNumber
hasPlanningDocs\tplanningDocs
planningDocUpload.{UPLOAD}.1\tplanningDocUpload
planningContact\tplanningContact
planningContactAdditional\tplanningContactAdditional
planningContactName\tplanningContactName
planningContactEmail\tplanningContactEmail
planningContactPhone\tplanningContactPhone
ownOrRent\townOrRent
uploadTitleOrDeed.{UPLOAD}.1\tuploadTitleOrDeed
rent\trent
lease.{UPLOAD}.1\tlease
landlordActivityAuthorization.{UPLOAD}.1\tlandlordActivityAuthorization
buyLOI.{UPLOAD}.1\tbuyLOI
rentLOI.{UPLOAD}.1\trentLOI
squareFootage\tsquareFootage
proposedUse\tproposedUse
floor\tfloor
previousUse\tpreviousUse
isVacant\tvacant
vacancyLength\tvacancyLength
businessStructure\tbusinessStructure
businessFormation.{UPLOAD}.1\tbusinessFormation
microbusiness\tmicrobusiness
businessActivity\tbusinessActivity
additionalActivity\tadditionalActivity
stateLicense\tstateLicense
legalTrue\tlegalTrue
legalInformation\tlegalInformation
`,
		"Business Ownership": `
firstName\tfirstName
lastName\tlastName
email\temail
DBAName\tDBAName
StreetAddress\tStreetAddress
bizOwnerNumber\tbizOwnerNumber
ownerCriteria1\townerCriteria1
bizOwnerName1\tbizOwnerName1
bizOwnerTitle1\tbizOwnerTitle1
bizOwnerEmail1\tbizOwnerEmail1
bizOwnerPhone1\tbizOwnerPhone1
bizOwnerAddress1.line1\tbizOwnerAddress1.line1
bizOwnerAddress1.line2\tbizOwnerAddress1.line2
bizOwnerAddress1.city\tbizOwnerAddress1.city
bizOwnerAddress1.state\tbizOwnerAddress1.state
bizOwnerAddress1.zip\tbizOwnerAddress1.zip
bizOwnerDateOfBirth1\tbizOwnerDateOfBirth1
bizOwnerPlaceOfBirth1\tbizOwnerPlaceOfBirth1
bizOwnerEmployer1\tbizOwnerEmployer1
bizOwnerPercent1\tbizOwnerPercent1
bizOwnerRevoked1\tbizOwnerRevoked1
bizOwnerConviction1\tbizOwnerConviction1
bizOwnerRace1\tbizOwnerRace1
bizOwnerNationality1\tbizOwnerNationality1
bizOwnerGender1\tbizOwnerGender1
\tbizOwnerGender1OtherScreendoor
bizOwnerEducationLevel1\tbizOwnerEducationLevel1
bizOwnerHouseholdIncome1\tbizOwnerHouseholdIncome1
bizOwnerHouseholdNumber1\tbizOwnerHouseholdNumber1
ownerCriteria2\townerCriteria2
bizOwnerName2\tbizOwnerName2
bizOwnerTitle2\tbizOwnerTitle2
bizOwnerEmail2\tbizOwnerEmail2
bizOwnerPhone2\tbizOwnerPhone2
bizOwnerAddress2.line1\tbizOwnerAddress2.line1
bizOwnerAddress2.line2\tbizOwnerAddress2.line2
bizOwnerAddress2.city\tbizOwnerAddress2.city
bizOwnerAddress2.state\tbizOwnerAddress2.state
bizOwnerAddress2.zip\tbizOwnerAddress2.zip
bizOwnerDateOfBirth2\tbizOwnerDateOfBirth2
bizOwnerPlaceOfBirth2\tbizOwnerPlaceOfBirth2
bizOwnerEmployer2\tbizOwnerEmployer2
bizOwnerPercent2\tbizOwnerPercent2
bizOwnerRevoked2\tbizOwnerRevoked2
bizOwnerConviction2\tbizOwnerConviction2
bizOwnerRace2\tbizOwnerRace2
bizOwnerNationality2\tbizOwnerNationality2
bizOwnerGender2\tbizOwnerGender2
\tbizOwnerGender2OtherScreendoor
bizOwnerEducationLevel2\tbizOwnerEducationLevel2
bizOwnerHouseholdIncome2\tbizOwnerHouseholdIncome2
bizOwnerHouseholdNumber2\tbizOwnerHouseholdNumber2
ownerCriteria3\townerCriteria3
bizOwnerName3\tbizOwnerName3
bizOwnerTitle3\tbizOwnerTitle3
bizOwnerEmail3\tbizOwnerEmail3
bizOwnerPhone3\tbizOwnerPhone3
bizOwnerAddress3.line1\tbizOwnerAddress3.line1
bizOwnerAddress3.line2\tbizOwnerAddress3.line2
bizOwnerAddress3.city\tbizOwnerAddress3.city
bizOwnerAddress3.state\tbizOwnerAddress3.state
bizOwnerAddress3.zip\tbizOwnerAddress3.zip
bizOwnerDateOfBirth3\tbizOwnerDateOfBirth3
bizOwnerPlaceOfBirth3\tbizOwnerPlaceOfBirth3
bizOwnerEmployer3\tbizOwnerEmployer3
bizOwnerPercent3\tbizOwnerPercent3
bizOwnerRevoked3\tbizOwnerRevoked3
bizOwnerConviction3\tbizOwnerConviction3
bizOwnerRace3\tbizOwnerRace3
bizOwnerNationality3\tbizOwnerNationality3
bizOwnerGender3\tbizOwnerGender3
\tbizOwnerGender3OtherScreendoor
bizOwnerEducationLevel3\tbizOwnerEducationLevel3
bizOwnerHouseholdIncome3\tbizOwnerHouseholdIncome3
bizOwnerHouseholdNumber3\tbizOwnerHouseholdNumber3
ownerCriteria4\townerCriteria4
bizOwnerName4\tbizOwnerName4
bizOwnerTitle4\tbizOwnerTitle4
bizOwnerEmail4\tbizOwnerEmail4
bizOwnerPhone4\tbizOwnerPhone4
bizOwnerAddress4.line1\tbizOwnerAddress4.line1
bizOwnerAddress4.line2\tbizOwnerAddress4.line2
bizOwnerAddress4.city\tbizOwnerAddress4.city
bizOwnerAddress4.state\tbizOwnerAddress4.state
bizOwnerAddress4.zip\tbizOwnerAddress4.zip
bizOwnerDateOfBirth4\tbizOwnerDateOfBirth4
bizOwnerPlaceOfBirth4\tbizOwnerPlaceOfBirth4
bizOwnerEmployer4\tbizOwnerEmployer4
bizOwnerPercent4\tbizOwnerPercent4
bizOwnerRevoked4\tbizOwnerRevoked4
bizOwnerConviction4\tbizOwnerConviction4
bizOwnerRace4\tbizOwnerRace4
bizOwnerNationality4\tbizOwnerNationality4
bizOwnerGender4\tbizOwnerGender4
\tbizOwnerGender4OtherScreendoor
bizOwnerEducationLevel4\tbizOwnerEducationLevel4
bizOwnerHouseholdIncome4\tbizOwnerHouseholdIncome4
bizOwnerHouseholdNumber4\tbizOwnerHouseholdNumber4
ownerCriteria5\townerCriteria5
bizOwnerName5\tbizOwnerName5
bizOwnerTitle5\tbizOwnerTitle5
bizOwnerEmail5\tbizOwnerEmail5
bizOwnerPhone5\tbizOwnerPhone5
bizOwnerAddress5.line1\tbizOwnerAddress5.line1
bizOwnerAddress5.line2\tbizOwnerAddress5.line2
bizOwnerAddress5.city\tbizOwnerAddress5.city
bizOwnerAddress5.state\tbizOwnerAddress5.state
bizOwnerAddress5.zip\tbizOwnerAddress5.zip
bizOwnerDateOfBirth5\tbizOwnerDateOfBirth5
bizOwnerPlaceOfBirth5\tbizOwnerPlaceOfBirth5
bizOwnerEmployer5\tbizOwnerEmployer5
bizOwnerPercent5\tbizOwnerPercent5
bizOwnerRevoked5\tbizOwnerRevoked5
bizOwnerConviction5\tbizOwnerConviction5
bizOwnerRace5\tbizOwnerRace5
bizOwnerNationality5\tbizOwnerNationality5
bizOwnerGender5\tbizOwnerGender5
\tbizOwnerGender5OtherScreendoor
bizOwnerEducationLevel5\tbizOwnerEducationLevel5
bizOwnerHouseholdIncome5\tbizOwnerHouseholdIncome5
bizOwnerHouseholdNumber5\tbizOwnerHouseholdNumber5
businessOwnerConvictionInformation1.convictionDate\tbusinessOwnerConvictionInformation1.convictionDate
businessOwnerConvictionInformation1.convictionDetails\tbusinessOwnerConvictionInformation1.convictionDetails
businessOwnerConvictionInformation1.wasThisPersonIncarcerated\tbusinessOwnerConvictionInformation1.wasThisPersonIncarcerated
businessOwnerConvictionInformation1.incarcerationStartDate\tbusinessOwnerConvictionInformation1.incarcerationStartDate
businessOwnerConvictionInformation1.incarcerationEndDate\tbusinessOwnerConvictionInformation1.incarcerationEndDate
businessOwnerConvictionInformation1.probation\tbusinessOwnerConvictionInformation1.probation
businessOwnerConvictionInformation1.probationStartDate\tbusinessOwnerConvictionInformation1.probationStartDate
businessOwnerConvictionInformation1.probationEndDate\tbusinessOwnerConvictionInformation1.probationEndDate
businessOwnerConvictionInformation1.uploadRehabilitationDocs.{UPLOAD}.1\tbusinessOwnerConvictionInformation1.uploadRehabilitationDocs
businessOwnerConvictionInformation2.convictionDate\tbusinessOwnerConvictionInformation2.convictionDate
businessOwnerConvictionInformation2.convictionDetails\tbusinessOwnerConvictionInformation2.convictionDetails
businessOwnerConvictionInformation2.wasThisPersonIncarcerated\tbusinessOwnerConvictionInformation2.wasThisPersonIncarcerated
businessOwnerConvictionInformation2.incarcerationStartDate\tbusinessOwnerConvictionInformation2.incarcerationStartDate
businessOwnerConvictionInformation2.incarcerationEndDate\tbusinessOwnerConvictionInformation2.incarcerationEndDate
businessOwnerConvictionInformation2.probation\tbusinessOwnerConvictionInformation2.probation
businessOwnerConvictionInformation2.probationStartDate\tbusinessOwnerConvictionInformation2.probationStartDate
businessOwnerConvictionInformation2.probationEndDate\tbusinessOwnerConvictionInformation2.probationEndDate
businessOwnerConvictionInformation2.uploadRehabilitationDocs.{UPLOAD}.1\tbusinessOwnerConvictionInformation2.uploadRehabilitationDocs
businessOwnerConvictionInformation3.convictionDate\tbusinessOwnerConvictionInformation3.convictionDate
businessOwnerConvictionInformation3.convictionDetails\tbusinessOwnerConvictionInformation3.convictionDetails
businessOwnerConvictionInformation3.wasThisPersonIncarcerated\tbusinessOwnerConvictionInformation3.wasThisPersonIncarcerated
businessOwnerConvictionInformation3.incarcerationStartDate\tbusinessOwnerConvictionInformation3.incarcerationStartDate
businessOwnerConvictionInformation3.incarcerationEndDate\tbusinessOwnerConvictionInformation3.incarcerationEndDate
businessOwnerConvictionInformation3.probation\tbusinessOwnerConvictionInformation3.probation
businessOwnerConvictionInformation3.probationStartDate\tbusinessOwnerConvictionInformation3.probationStartDate
businessOwnerConvictionInformation3.probationEndDate\tbusinessOwnerConvictionInformation3.probationEndDate
businessOwnerConvictionInformation3.uploadRehabilitationDocs.{UPLOAD}.1\tbusinessOwnerConvictionInformation3.uploadRehabilitationDocs
businessOwnerConvictionInformation4.convictionDate\tbusinessOwnerConvictionInformation4.convictionDate
businessOwnerConvictionInformation4.convictionDetails\tbusinessOwnerConvictionInformation4.convictionDetails
businessOwnerConvictionInformation4.wasThisPersonIncarcerated\tbusinessOwnerConvictionInformation4.wasThisPersonIncarcerated
businessOwnerConvictionInformation4.incarcerationStartDate\tbusinessOwnerConvictionInformation4.incarcerationStartDate
businessOwnerConvictionInformation4.incarcerationEndDate\tbusinessOwnerConvictionInformation4.incarcerationEndDate
businessOwnerConvictionInformation4.probation\tbusinessOwnerConvictionInformation4.probation
businessOwnerConvictionInformation4.probationStartDate\tbusinessOwnerConvictionInformation4.probationStartDate
businessOwnerConvictionInformation4.probationEndDate\tbusinessOwnerConvictionInformation4.probationEndDate
businessOwnerConvictionInformation4.uploadRehabilitationDocs.{UPLOAD}.1\tbusinessOwnerConvictionInformation4.uploadRehabilitationDocs
businessOwnerConvictionInformation5.convictionDate\tbusinessOwnerConvictionInformation5.convictionDate
businessOwnerConvictionInformation5.convictionDetails\tbusinessOwnerConvictionInformation5.convictionDetails
businessOwnerConvictionInformation5.wasThisPersonIncarcerated\tbusinessOwnerConvictionInformation5.wasThisPersonIncarcerated
businessOwnerConvictionInformation5.incarcerationStartDate\tbusinessOwnerConvictionInformation5.incarcerationStartDate
businessOwnerConvictionInformation5.incarcerationEndDate\tbusinessOwnerConvictionInformation5.incarcerationEndDate
businessOwnerConvictionInformation5.probation\tbusinessOwnerConvictionInformation5.probation
businessOwnerConvictionInformation5.probationStartDate\tbusinessOwnerConvictionInformation5.probationStartDate
businessOwnerConvictionInformation5.probationEndDate\tbusinessOwnerConvictionInformation5.probationEndDate
businessOwnerConvictionInformation5.uploadRehabilitationDocs.{UPLOAD}.1\tbusinessOwnerConvictionInformation5.uploadRehabilitationDocs
\tScreendoor conviction 1
\tScreendoor conviction 2
\tScreendoor conviction 3
\tScreendoor conviction 4
\tScreendoor conviction 5
entityOwners\tentityOwners
entityNumber\tentityNumber
businessNameEntity1\tbusinessNameEntity1
tradeNameEntity1\ttradeNameEntity1
businessAddressEntity1.line1\tbusinessAddressEntity1.line1
businessAddressEntity1.line2\tbusinessAddressEntity1.line2
businessAddressEntity1.city\tbusinessAddressEntity1.city
businessAddressEntity1.state\tbusinessAddressEntity1.state
businessAddressEntity1.zip\tbusinessAddressEntity1.zip
dateOfIncorporationEntity1\tdateOfIncorporationEntity1
percentageOfOwnershipEntity1\tpercentageOfOwnershipEntity1
ownershipStructureDetailsEntity1\townershipStructureDetailsEntity1
businessFormationDocs1.1.businesssFormationDocumentsEntity1.{UPLOAD}.1\tbusinesssFormationDocumentsEntity1.1
businessFormationDocs1.2.businesssFormationDocumentsEntity1.{UPLOAD}.1\tbusinesssFormationDocumentsEntity1.2
businessFormationDocs1.3.businesssFormationDocumentsEntity1.{UPLOAD}.1\tbusinesssFormationDocumentsEntity1.3
entityOwnerPersonEntity1.1.entityOwnerPerson.name\tentityOwnerPersonEntity1.entityOwnerPerson1.name
entityOwnerPersonEntity1.1.entityOwnerPerson.title\tentityOwnerPersonEntity1.entityOwnerPerson1.title
entityOwnerPersonEntity1.1.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity1.entityOwnerPerson1.dateOfBirth
entityOwnerPersonEntity1.1.entityOwnerPerson.email\tentityOwnerPersonEntity1.entityOwnerPerson1.email
entityOwnerPersonEntity1.1.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity1.entityOwnerPerson1.percentOwnership
entityOwnerPersonEntity1.2.entityOwnerPerson.name\tentityOwnerPersonEntity1.entityOwnerPerson2.name
entityOwnerPersonEntity1.2.entityOwnerPerson.title\tentityOwnerPersonEntity1.entityOwnerPerson2.title
entityOwnerPersonEntity1.2.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity1.entityOwnerPerson2.dateOfBirth
entityOwnerPersonEntity1.2.entityOwnerPerson.email\tentityOwnerPersonEntity1.entityOwnerPerson2.email
entityOwnerPersonEntity1.2.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity1.entityOwnerPerson2.percentOwnership
entityOwnerPersonEntity1.3.entityOwnerPerson.name\tentityOwnerPersonEntity1.entityOwnerPerson3.name
entityOwnerPersonEntity1.3.entityOwnerPerson.title\tentityOwnerPersonEntity1.entityOwnerPerson3.title
entityOwnerPersonEntity1.3.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity1.entityOwnerPerson3.dateOfBirth
entityOwnerPersonEntity1.3.entityOwnerPerson.email\tentityOwnerPersonEntity1.entityOwnerPerson3.email
entityOwnerPersonEntity1.3.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity1.entityOwnerPerson3.percentOwnership
entityOwnerPersonEntity1.4.entityOwnerPerson.name\tentityOwnerPersonEntity1.entityOwnerPerson4.name
entityOwnerPersonEntity1.4.entityOwnerPerson.title\tentityOwnerPersonEntity1.entityOwnerPerson4.title
entityOwnerPersonEntity1.4.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity1.entityOwnerPerson4.dateOfBirth
entityOwnerPersonEntity1.4.entityOwnerPerson.email\tentityOwnerPersonEntity1.entityOwnerPerson4.email
entityOwnerPersonEntity1.4.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity1.entityOwnerPerson4.percentOwnership
entityOwnerPersonEntity1.5.entityOwnerPerson.name\tentityOwnerPersonEntity1.entityOwnerPerson5.name
entityOwnerPersonEntity1.5.entityOwnerPerson.title\tentityOwnerPersonEntity1.entityOwnerPerson5.title
entityOwnerPersonEntity1.5.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity1.entityOwnerPerson5.dateOfBirth
entityOwnerPersonEntity1.5.entityOwnerPerson.email\tentityOwnerPersonEntity1.entityOwnerPerson5.email
entityOwnerPersonEntity1.5.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity1.entityOwnerPerson5.percentOwnership
businessNameEntity2\tbusinessNameEntity2
tradeNameEntity2\ttradeNameEntity2
businessAddressEntity2.line1\tbusinessAddressEntity2.line1
businessAddressEntity2.line2\tbusinessAddressEntity2.line2
businessAddressEntity2.city\tbusinessAddressEntity2.city
businessAddressEntity2.state\tbusinessAddressEntity2.state
businessAddressEntity2.zip\tbusinessAddressEntity2.zip
dateOfIncorporationEntity2\tdateOfIncorporationEntity2
percentageOfOwnershipEntity2\tpercentageOfOwnershipEntity2
ownershipStructureDetailsEntity2\townershipStructureDetailsEntity2
businessFormationDocs2.1.businesssFormationDocumentsEntity2.{UPLOAD}.1\tbusinesssFormationDocumentsEntity2.1
businessFormationDocs2.2.businesssFormationDocumentsEntity2.{UPLOAD}.1\tbusinesssFormationDocumentsEntity2.2
businessFormationDocs2.3.businesssFormationDocumentsEntity2.{UPLOAD}.1\tbusinesssFormationDocumentsEntity2.3
entityOwnerPersonEntity2.1.entityOwnerPerson.name\tentityOwnerPersonEntity2.entityOwnerPerson1.name
entityOwnerPersonEntity2.1.entityOwnerPerson.title\tentityOwnerPersonEntity2.entityOwnerPerson1.title
entityOwnerPersonEntity2.1.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity2.entityOwnerPerson1.dateOfBirth
entityOwnerPersonEntity2.1.entityOwnerPerson.email\tentityOwnerPersonEntity2.entityOwnerPerson1.email
entityOwnerPersonEntity2.1.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity2.entityOwnerPerson1.percentOwnership
entityOwnerPersonEntity2.2.entityOwnerPerson.name\tentityOwnerPersonEntity2.entityOwnerPerson2.name
entityOwnerPersonEntity2.2.entityOwnerPerson.title\tentityOwnerPersonEntity2.entityOwnerPerson2.title
entityOwnerPersonEntity2.2.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity2.entityOwnerPerson2.dateOfBirth
entityOwnerPersonEntity2.2.entityOwnerPerson.email\tentityOwnerPersonEntity2.entityOwnerPerson2.email
entityOwnerPersonEntity2.2.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity2.entityOwnerPerson2.percentOwnership
entityOwnerPersonEntity2.3.entityOwnerPerson.name\tentityOwnerPersonEntity2.entityOwnerPerson3.name
entityOwnerPersonEntity2.3.entityOwnerPerson.title\tentityOwnerPersonEntity2.entityOwnerPerson3.title
entityOwnerPersonEntity2.3.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity2.entityOwnerPerson3.dateOfBirth
entityOwnerPersonEntity2.3.entityOwnerPerson.email\tentityOwnerPersonEntity2.entityOwnerPerson3.email
entityOwnerPersonEntity2.3.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity2.entityOwnerPerson3.percentOwnership
entityOwnerPersonEntity2.4.entityOwnerPerson.name\tentityOwnerPersonEntity2.entityOwnerPerson4.name
entityOwnerPersonEntity2.4.entityOwnerPerson.title\tentityOwnerPersonEntity2.entityOwnerPerson4.title
entityOwnerPersonEntity2.4.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity2.entityOwnerPerson4.dateOfBirth
entityOwnerPersonEntity2.4.entityOwnerPerson.email\tentityOwnerPersonEntity2.entityOwnerPerson4.email
entityOwnerPersonEntity2.4.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity2.entityOwnerPerson4.percentOwnership
entityOwnerPersonEntity2.5.entityOwnerPerson.name\tentityOwnerPersonEntity2.entityOwnerPerson5.name
entityOwnerPersonEntity2.5.entityOwnerPerson.title\tentityOwnerPersonEntity2.entityOwnerPerson5.title
entityOwnerPersonEntity2.5.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity2.entityOwnerPerson5.dateOfBirth
entityOwnerPersonEntity2.5.entityOwnerPerson.email\tentityOwnerPersonEntity2.entityOwnerPerson5.email
entityOwnerPersonEntity2.5.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity2.entityOwnerPerson5.percentOwnership
businessNameEntity3\tbusinessNameEntity3
tradeNameEntity3\ttradeNameEntity3
businessAddressEntity3.line1\tbusinessAddressEntity3.line1
businessAddressEntity3.line2\tbusinessAddressEntity3.line2
businessAddressEntity3.city\tbusinessAddressEntity3.city
businessAddressEntity3.state\tbusinessAddressEntity3.state
businessAddressEntity3.zip\tbusinessAddressEntity3.zip
dateOfIncorporationEntity3\tdateOfIncorporationEntity3
percentageOfOwnershipEntity3\tpercentageOfOwnershipEntity3
ownershipStructureDetailsEntity3\townershipStructureDetailsEntity3
businessFormationDocs3.1.businesssFormationDocumentsEntity3.{UPLOAD}.1\tbusinesssFormationDocumentsEntity3.1
businessFormationDocs3.2.businesssFormationDocumentsEntity3.{UPLOAD}.1\tbusinesssFormationDocumentsEntity3.2
businessFormationDocs3.3.businesssFormationDocumentsEntity3.{UPLOAD}.1\tbusinesssFormationDocumentsEntity3.3
entityOwnerPersonEntity3.1.entityOwnerPerson.name\tentityOwnerPersonEntity3.entityOwnerPerson1.name
entityOwnerPersonEntity3.1.entityOwnerPerson.title\tentityOwnerPersonEntity3.entityOwnerPerson1.title
entityOwnerPersonEntity3.1.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity3.entityOwnerPerson1.dateOfBirth
entityOwnerPersonEntity3.1.entityOwnerPerson.email\tentityOwnerPersonEntity3.entityOwnerPerson1.email
entityOwnerPersonEntity3.1.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity3.entityOwnerPerson1.percentOwnership
entityOwnerPersonEntity3.2.entityOwnerPerson.name\tentityOwnerPersonEntity3.entityOwnerPerson2.name
entityOwnerPersonEntity3.2.entityOwnerPerson.title\tentityOwnerPersonEntity3.entityOwnerPerson2.title
entityOwnerPersonEntity3.2.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity3.entityOwnerPerson2.dateOfBirth
entityOwnerPersonEntity3.2.entityOwnerPerson.email\tentityOwnerPersonEntity3.entityOwnerPerson2.email
entityOwnerPersonEntity3.2.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity3.entityOwnerPerson2.percentOwnership
entityOwnerPersonEntity3.3.entityOwnerPerson.name\tentityOwnerPersonEntity3.entityOwnerPerson3.name
\tentityOwnerPersonEntity3.entityOwnerPerson3.title
entityOwnerPersonEntity3.3.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity3.entityOwnerPerson3.dateOfBirth
entityOwnerPersonEntity3.3.entityOwnerPerson.email\tentityOwnerPersonEntity3.entityOwnerPerson3.email
entityOwnerPersonEntity3.3.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity3.entityOwnerPerson3.percentOwnership
entityOwnerPersonEntity3.4.entityOwnerPerson.name\tentityOwnerPersonEntity3.entityOwnerPerson4.name
entityOwnerPersonEntity3.4.entityOwnerPerson.title\tentityOwnerPersonEntity3.entityOwnerPerson4.title
entityOwnerPersonEntity3.4.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity3.entityOwnerPerson4.dateOfBirth
entityOwnerPersonEntity3.4.entityOwnerPerson.email\tentityOwnerPersonEntity3.entityOwnerPerson4.email
entityOwnerPersonEntity3.4.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity3.entityOwnerPerson4.percentOwnership
entityOwnerPersonEntity3.5.entityOwnerPerson.name\tentityOwnerPersonEntity3.entityOwnerPerson5.name
entityOwnerPersonEntity3.5.entityOwnerPerson.title\tentityOwnerPersonEntity3.entityOwnerPerson5.title
entityOwnerPersonEntity3.5.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity3.entityOwnerPerson5.dateOfBirth
entityOwnerPersonEntity3.5.entityOwnerPerson.email\tentityOwnerPersonEntity3.entityOwnerPerson5.email
entityOwnerPersonEntity3.5.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity3.entityOwnerPerson5.percentOwnership
businessNameEntity4\tbusinessNameEntity4
tradeNameEntity4\ttradeNameEntity4
businessAddressEntity4.line1\tbusinessAddressEntity4.line1
businessAddressEntity4.line2\tbusinessAddressEntity4.line2
businessAddressEntity4.city\tbusinessAddressEntity4.city
businessAddressEntity4.state\tbusinessAddressEntity4.state
businessAddressEntity4.zip\tbusinessAddressEntity4.zip
dateOfIncorporationEntity4\tdateOfIncorporationEntity4
percentageOfOwnershipEntity4\tpercentageOfOwnershipEntity4
ownershipStructureDetailsEntity4\townershipStructureDetailsEntity4
businessFormationDocs4.1.businesssFormationDocumentsEntity4.{UPLOAD}.1\tbusinesssFormationDocumentsEntity4.1
businessFormationDocs4.2.businesssFormationDocumentsEntity4.{UPLOAD}.1\tbusinesssFormationDocumentsEntity4.2
businessFormationDocs4.3.businesssFormationDocumentsEntity4.{UPLOAD}.1\tbusinesssFormationDocumentsEntity4.3
entityOwnerPersonEntity4.1.entityOwnerPerson.name\tentityOwnerPersonEntity4.entityOwnerPerson1.name
entityOwnerPersonEntity4.1.entityOwnerPerson.title\tentityOwnerPersonEntity4.entityOwnerPerson1.title
entityOwnerPersonEntity4.1.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity4.entityOwnerPerson1.dateOfBirth
entityOwnerPersonEntity4.1.entityOwnerPerson.email\tentityOwnerPersonEntity4.entityOwnerPerson1.email
entityOwnerPersonEntity4.1.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity4.entityOwnerPerson1.percentOwnership
entityOwnerPersonEntity4.2.entityOwnerPerson.name\tentityOwnerPersonEntity4.entityOwnerPerson2.name
entityOwnerPersonEntity4.2.entityOwnerPerson.title\tentityOwnerPersonEntity4.entityOwnerPerson2.title
entityOwnerPersonEntity4.2.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity4.entityOwnerPerson2.dateOfBirth
entityOwnerPersonEntity4.2.entityOwnerPerson.email\tentityOwnerPersonEntity4.entityOwnerPerson2.email
entityOwnerPersonEntity4.2.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity4.entityOwnerPerson2.percentOwnership
entityOwnerPersonEntity4.3.entityOwnerPerson.name\tentityOwnerPersonEntity4.entityOwnerPerson3.name
entityOwnerPersonEntity4.3.entityOwnerPerson.title\tentityOwnerPersonEntity4.entityOwnerPerson3.title
entityOwnerPersonEntity4.3.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity4.entityOwnerPerson3.dateOfBirth
entityOwnerPersonEntity4.3.entityOwnerPerson.email\tentityOwnerPersonEntity4.entityOwnerPerson3.email
entityOwnerPersonEntity4.3.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity4.entityOwnerPerson3.percentOwnership
entityOwnerPersonEntity4.4.entityOwnerPerson.name\tentityOwnerPersonEntity4.entityOwnerPerson4.name
entityOwnerPersonEntity4.4.entityOwnerPerson.title\tentityOwnerPersonEntity4.entityOwnerPerson4.title
entityOwnerPersonEntity4.4.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity4.entityOwnerPerson4.dateOfBirth
entityOwnerPersonEntity4.4.entityOwnerPerson.email\tentityOwnerPersonEntity4.entityOwnerPerson4.email
entityOwnerPersonEntity4.4.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity4.entityOwnerPerson4.percentOwnership
entityOwnerPersonEntity4.5.entityOwnerPerson.name\tentityOwnerPersonEntity4.entityOwnerPerson5.name
entityOwnerPersonEntity4.5.entityOwnerPerson.title\tentityOwnerPersonEntity4.entityOwnerPerson5.title
entityOwnerPersonEntity4.5.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity4.entityOwnerPerson5.dateOfBirth
entityOwnerPersonEntity4.5.entityOwnerPerson.email\tentityOwnerPersonEntity4.entityOwnerPerson5.email
entityOwnerPersonEntity4.5.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity4.entityOwnerPerson5.percentOwnership
businessNameEntity5\tbusinessNameEntity5
tradeNameEntity5\ttradeNameEntity5
businessAddressEntity5.line1\tbusinessAddressEntity5.line1
businessAddressEntity5.line2\tbusinessAddressEntity5.line2
businessAddressEntity5.city\tbusinessAddressEntity5.city
businessAddressEntity5.state\tbusinessAddressEntity5.state
businessAddressEntity5.zip\tbusinessAddressEntity5.zip
dateOfIncorporationEntity5\tdateOfIncorporationEntity5
percentageOfOwnershipEntity5\tpercentageOfOwnershipEntity5
ownershipStructureDetailsEntity5\townershipStructureDetailsEntity5
businessFormationDocs5.1.businesssFormationDocumentsEntity5.{UPLOAD}.1\tbusinesssFormationDocumentsEntity5.1
businessFormationDocs5.2.businesssFormationDocumentsEntity5.{UPLOAD}.1\tbusinesssFormationDocumentsEntity5.2
businessFormationDocs5.3.businesssFormationDocumentsEntity5.{UPLOAD}.1\tbusinesssFormationDocumentsEntity5.3
entityOwnerPersonEntity5.1.entityOwnerPerson.name\tentityOwnerPersonEntity5.entityOwnerPerson1.name
entityOwnerPersonEntity5.1.entityOwnerPerson.title\tentityOwnerPersonEntity5.entityOwnerPerson1.title
entityOwnerPersonEntity5.1.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity5.entityOwnerPerson1.dateOfBirth
entityOwnerPersonEntity5.1.entityOwnerPerson.email\tentityOwnerPersonEntity5.entityOwnerPerson1.email
entityOwnerPersonEntity5.1.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity5.entityOwnerPerson1.percentOwnership
entityOwnerPersonEntity5.2.entityOwnerPerson.name\tentityOwnerPersonEntity5.entityOwnerPerson2.name
entityOwnerPersonEntity5.2.entityOwnerPerson.title\tentityOwnerPersonEntity5.entityOwnerPerson2.title
entityOwnerPersonEntity5.2.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity5.entityOwnerPerson2.dateOfBirth
entityOwnerPersonEntity5.2.entityOwnerPerson.email\tentityOwnerPersonEntity5.entityOwnerPerson2.email
entityOwnerPersonEntity5.2.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity5.entityOwnerPerson2.percentOwnership
entityOwnerPersonEntity5.3.entityOwnerPerson.name\tentityOwnerPersonEntity5.entityOwnerPerson3.name
entityOwnerPersonEntity5.3.entityOwnerPerson.title\tentityOwnerPersonEntity5.entityOwnerPerson3.title
entityOwnerPersonEntity5.3.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity5.entityOwnerPerson3.dateOfBirth
entityOwnerPersonEntity5.3.entityOwnerPerson.email\tentityOwnerPersonEntity5.entityOwnerPerson3.email
entityOwnerPersonEntity5.3.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity5.entityOwnerPerson3.percentOwnership
entityOwnerPersonEntity5.4.entityOwnerPerson.name\tentityOwnerPersonEntity5.entityOwnerPerson4.name
entityOwnerPersonEntity5.4.entityOwnerPerson.title\tentityOwnerPersonEntity5.entityOwnerPerson4.title
entityOwnerPersonEntity5.4.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity5.entityOwnerPerson4.dateOfBirth
entityOwnerPersonEntity5.4.entityOwnerPerson.email\tentityOwnerPersonEntity5.entityOwnerPerson4.email
entityOwnerPersonEntity5.4.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity5.entityOwnerPerson4.percentOwnership
entityOwnerPersonEntity5.5.entityOwnerPerson.name\tentityOwnerPersonEntity5.entityOwnerPerson5.name
entityOwnerPersonEntity5.5.entityOwnerPerson.title\tentityOwnerPersonEntity5.entityOwnerPerson5.title
entityOwnerPersonEntity5.5.entityOwnerPerson.dateOfBirth\tentityOwnerPersonEntity5.entityOwnerPerson5.dateOfBirth
entityOwnerPersonEntity5.5.entityOwnerPerson.email\tentityOwnerPersonEntity5.entityOwnerPerson5.email
entityOwnerPersonEntity5.5.entityOwnerPerson.percentOwnership\tentityOwnerPersonEntity5.entityOwnerPerson5.percentOwnership
\tScreendoor Entity 1
\tScreendoor Entity 2
\tScreendoor Entity 3
\tScreendoor Entity 4
\tScreendoor Entity Overflow
\tScreendoor Entity Owner 1
\tScreendoor Entity Owner 2
\tScreendoor Entity Owner 3
\tScreendoor Entity Owner 4
\tScreendoor Entity 5 Owner Overflow
additionalInvestors\tadditionalInvestors
investors.1.investor.name\tinvestors.investor1.name
investors.1.investor.investorType\tinvestors.investor1.investorType
investors.1.investor.percentOwnership\tinvestors.investor1.percentOwnership
investors.1.investor.whatIsTheInterestOrInvestment\tinvestors.investor1.whatIsTheInterestOrInvestment
investors.2.investor.name\tinvestors.investor2.name
investors.2.investor.investorType\tinvestors.investor2.investorType
investors.2.investor.percentOwnership\tinvestors.investor2.percentOwnership
investors.2.investor.whatIsTheInterestOrInvestment\tinvestors.investor2.whatIsTheInterestOrInvestment
investors.3.investor.name\tinvestors.investor3.name
investors.3.investor.investorType\tinvestors.investor3.investorType
investors.3.investor.percentOwnership\tinvestors.investor3.percentOwnership
investors.3.investor.whatIsTheInterestOrInvestment\tinvestors.investor3.whatIsTheInterestOrInvestment
investors.4.investor.name\tinvestors.investor4.name
investors.4.investor.investorType\tinvestors.investor4.investorType
investors.4.investor.percentOwnership\tinvestors.investor4.percentOwnership
investors.4.investor.whatIsTheInterestOrInvestment\tinvestors.investor4.whatIsTheInterestOrInvestment
investors.5.investor.name\tinvestors.investor5.name
investors.5.investor.investorType\tinvestors.investor5.investorType
investors.5.investor.percentOwnership\tinvestors.investor5.percentOwnership
investors.5.investor.whatIsTheInterestOrInvestment\tinvestors.investor5.whatIsTheInterestOrInvestment
investors.overflow\tinvestors.overflow
legalTrue\tlegalTrue
legalOmit\tlegalOmit
`,
		"Community Outreach": `
firstName\tfirstName
lastName\tlastName
email\temail
DBAName\tDBAName
StreetAddress\tStreetAddress
\tScreendoorAddress
haveYouInformedYourNeighbors\thaveYouInformedYourNeighbors
dateOfYourOutreachMeeting\tdateOfYourOutreachMeeting
howDidYouLetYourDistrictSupervisorKnow\thowDidYouLetYourDistrictSupervisorKnow
dateYouContactedYourDistrictSupervisor\tdateYouContactedYourDistrictSupervisor
howDidYouLetOfficeOfCannabisKnow\thowDidYouLetOfficeOfCannabisKnow
dateYouContactedOfficeOfCannabis\tdateYouContactedOfficeOfCannabis
neighborhoodNotice.1.uploadYourNeighborhoodNotice.{UPLOAD}.1\tuploadYourNeighborhoodNotice1
neighborhoodNotice.2.uploadYourNeighborhoodNotice.{UPLOAD}.1\tuploadYourNeighborhoodNotice2
neighborhoodNotice.3.uploadYourNeighborhoodNotice.{UPLOAD}.1\tuploadYourNeighborhoodNotice3
neighborhoodNotice.4.uploadYourNeighborhoodNotice.{UPLOAD}.1\tuploadYourNeighborhoodNotice4
uploadSignInSheetsFromNeighborhoodMeetings.{UPLOAD}.1\tuploadSignInSheetsFromNeighborhoodMeetings
uploadMinutesFromNeighborhoodMeetings.{UPLOAD}.1\tuploadMinutesFromNeighborhoodMeetings
meetingMaterials.1.uploadMeetingMaterials.{UPLOAD}.1\tuploadMeetingMaterials1
meetingMaterials.2.uploadMeetingMaterials.{UPLOAD}.1\tuploadMeetingMaterials2
uploadWrittenInputFromNeighbors.{UPLOAD}.1\tuploadWrittenInputFromNeighbors
uploadListOfNeighborsSentNoticeTo.{UPLOAD}.1\tuploadListOfNeighborsSentNoticeTo
communityLiaisonFullName\tcommunityLiaisonFullName
communityLiaisonTitle\tcommunityLiaisonTitle
communityLiaisonPhoneNumber\tcommunityLiaisonPhoneNumber
communityLiaisonEmail\tcommunityLiaisonEmail
whereDoesTheLiaisonReceiveMail.line1\twhereDoesTheLiaisonReceiveMail.line1
whereDoesTheLiaisonReceiveMail.line2\twhereDoesTheLiaisonReceiveMail.line2
whereDoesTheLiaisonReceiveMail.city\twhereDoesTheLiaisonReceiveMail.city
whereDoesTheLiaisonReceiveMail.state\twhereDoesTheLiaisonReceiveMail.state
whereDoesTheLiaisonReceiveMail.zip\twhereDoesTheLiaisonReceiveMail.zip
selectTypesOfActivitiesChoosing\tselectTypesOfActivitiesChoosing
willYouAllowOnsiteConsumption\twillYouAllowOnsiteConsumption
commitToAboveGoodNeighborRequirements\tcommitToAboveGoodNeighborRequirements
commitToAboveGoodNeighborRequirementsStorefront\tcommitToAboveGoodNeighborRequirementsStorefront
commitToAboveGoodNeighborRequirementsOnsite\tcommitToAboveGoodNeighborRequirementsOnsite
haveYouMadeMoreCommitments\thaveYouMadeMoreCommitments
describeOtherCommitmentsMade\tdescribeOtherCommitmentsMade
commitToAboveAdditionalGoodNeighbor\tcommitToAboveAdditionalGoodNeighbor
uploadFinalExecutedGoodNeighborPolicy.{UPLOAD}.1\tuploadFinalExecutedGoodNeighborPolicy
willYouHaveCompassionProgram\twillYouHaveCompassionProgram
populationsWillYouServe\tpopulationsWillYouServe
otherPopulation\totherPopulation
patientsServedPerYear\tpatientsServedPerYear
keepRecordsEnsurePatientPrivacy\tkeepRecordsEnsurePatientPrivacy
percentageOfInventoryReservedForMedicinal\tpercentageOfInventoryReservedForMedicinal
percentageOfMedicalForCompassionPatients\tpercentageOfMedicalForCompassionPatients
planOnSupportingCompassionPatients\tplanOnSupportingCompassionPatients
hadCompassionProgramBeforeJan2018\thadCompassionProgramBeforeJanTwoZeroOneEight
describeTermsOfPreviousCompassionProgram\tdescribeTermsOfPreviousCompassionProgram
existingMedicalCannabisDispensary\texistingMedicalCannabisDispensary
specificSupportForEquityApplicants\tspecificSupportForEquityApplicants
otherEquityApplicantSupport\totherEquityApplicantSupport
provideOpportunitiesForWarOnDrugsImpacted\tprovideOpportunitiesForWarOnDrugsImpacted
otherOpportunitiesSupport\totherOpportunitiesSupport
supportSanFranciscoEquityGoals\tsupportSanFranciscoEquityGoals
otherSupport\totherSupport
moreAgreements\tmoreAgreements
additionalAgreementDescription\tadditionalAgreementDescription
understandMisrepresentationPenaltyPerjury\tunderstandMisrepresentationPenaltyPerjury
\tProof of Outreach Section Notes
\tCommunity Liaison Section Notes
\tGood Neighbor Policy Section Notes
\tCompassion Program Section Notes
\tEquity Goals Section Notes
\tOther Community Benefits Section Notes
\tLegal Agreements Section Notes
`,
		"General Operations": `
firstName\tfirstName
lastName\tlastName
email\temail
DBAName\tDBAName
StreetAddress\tStreetAddress
\tScreendoorAddress
fulfillRenewableEnergyMandate\tfulfillRenewableEnergyMandate
acknowledgeEnergyAssessment\tacknowledgeEnergyAssessment
payRecologyForWastePickup\tpayRecologyForWastePickup
describeCannabisShipments\tdescribeCannabisShipments
ensureSafetyDuringShipments\tensureSafetyDuringShipments
preventTheftDuringShipments\tpreventTheftDuringShipments
moveInventoryToAndFrom\tmoveInventoryToAndFrom
inventoryReconciliationFrequency\tinventoryReconciliationFrequency
describeInventoryReconciliation\tdescribeInventoryReconciliation
trackAndTraceContactFullName\ttrackAndTraceContactFullName
trackAndTraceContactPhoneNumber\ttrackAndTraceContactPhoneNumber
verifyProductLabels\tverifyProductLabels
checkBatchesInAndOut\tcheckBatchesInAndOut
preventProductSpoilage\tpreventProductSpoilage
handleReturns\thandleReturns
selectHazardousMaterials\tselectHazardousMaterials
otherHazardousMaterials\totherHazardousMaterials
storeMaterialsSafely\tstoreMaterialsSafely
numberOfStaff\tnumberOfStaff
uploadOrganizationalChart.{UPLOAD}.1\tuploadOrganizationalChart
uploadStaffingAndLaborForm.{UPLOAD}.1\tuploadStaffingAndLaborForm
agreeToHireOver21\tagreeToHireOver21
uploadSignedFirstSourceHiringAgreement.{UPLOAD}.1\tuploadSignedFirstSourceHiringAgreement
describeEmploymentOutreach\tdescribeEmploymentOutreach
stateDocument.{UPLOAD}.1\tstateDocument
cityDocument.{UPLOAD}.1\tcityDocument
cityDocumentUpload.1.uploadAdditionalDocuments.{UPLOAD}.1\tuploadAdditionalDocuments1
cityDocumentUpload.2.uploadAdditionalDocuments.{UPLOAD}.1\tuploadAdditionalDocuments2
cityDocumentUpload.3.uploadAdditionalDocuments.{UPLOAD}.1\tuploadAdditionalDocuments3
underPenaltyOfPerjury\tunderPenaltyOfPerjury
\tSourcing Energy and Waste Section Notes
\tProduct Tracking Section Notes
\tHandling Cannabis Products Section Notes
\tHazardous Materials Section Notes
\tAbout Your Staff Section Notes
\tHiring for Entry Level Positions Section Notes
\tUpload Documents Section Notes
\tLegal Agreements Section Notes`,
		"Security Plan": `
firstName\tfirstName
lastName\tlastName
email\temail
DBAName\tDBAName
StreetAddress\tStreetAddress
\tscreendoorAddress
securityEmployees.1.fullName\tsecurityEmployees1.fullName
securityEmployees.1.jobTitle\tsecurityEmployees1.jobTitle
securityEmployees.1.responsibility\tsecurityEmployees1.responsibility
securityEmployees.1.phoneNumber\tsecurityEmployees1.phoneNumber
securityEmployees.1.email\tsecurityEmployees1.email
securityEmployees.2.fullName\tsecurityEmployees2.fullName
securityEmployees.2.jobTitle\tsecurityEmployees2.jobTitle
securityEmployees.2.responsibility\tsecurityEmployees2.responsibility
securityEmployees.2.phoneNumber\tsecurityEmployees2.phoneNumber
securityEmployees.2.email\tsecurityEmployees2.email
securityEmployees.3.fullName\tsecurityEmployees3.fullName
securityEmployees.3.jobTitle\tsecurityEmployees3.jobTitle
securityEmployees.3.responsibility\tsecurityEmployees3.responsibility
securityEmployees.3.phoneNumber\tsecurityEmployees3.phoneNumber
securityEmployees.3.email\tsecurityEmployees3.email
securityEmployees.4.fullName\tsecurityEmployees4.fullName
securityEmployees.4.jobTitle\tsecurityEmployees4.jobTitle
securityEmployees.4.responsibility\tsecurityEmployees4.responsibility
securityEmployees.4.phoneNumber\tsecurityEmployees4.phoneNumber
securityEmployees.4.email\tsecurityEmployees4.email
securityEmployees.5.fullName\tsecurityEmployees5.fullName
securityEmployees.5.jobTitle\tsecurityEmployees5.jobTitle
securityEmployees.5.responsibility\tsecurityEmployees5.responsibility
securityEmployees.5.phoneNumber\tsecurityEmployees5.phoneNumber
securityEmployees.5.email\tsecurityEmployees5.email
screendoorEmployeeOverflow\tscreendoorEmployeeOverflow
uploadEmployeeBadgeTemplate.{UPLOAD}.1\tuploadEmployeeBadgeTemplate
handleBadgeAccessOnChange\thandleBadgeAccessOnChange
handleBadgeAccessOnEnd\thandleBadgeAccessOnEnd
ensureAuthorizedAreaAccess\tensureAuthorizedAreaAccess
other2\tother2
recordContractorVendorAccess\trecordContractorVendorAccess
describeOnlineSystem\tdescribeOnlineSystem
uploadContractorVendorSignInTemplate.{UPLOAD}.1\tuploadContractorVendorSignInTemplate
recordRetentionPeriod\trecordRetentionPeriod
sfpdDistrictStation\tsfpdDistrictStation
preventCannabisGoodsDiversion\tpreventCannabisGoodsDiversion
other4\tother4
alarmCompanyName\talarmCompanyName
licenseNumber\tlicenseNumber
businessAddressOfAlarmCompany.line1\tbusinessAddressOfAlarmCompany.line1
businessAddressOfAlarmCompany.line2\tbusinessAddressOfAlarmCompany.line2
businessAddressOfAlarmCompany.city\tbusinessAddressOfAlarmCompany.city
businessAddressOfAlarmCompany.state\tbusinessAddressOfAlarmCompany.state
businessAddressOfAlarmCompany.zip\tbusinessAddressOfAlarmCompany.zip
businessPhoneNumber1\tbusinessPhoneNumber1
generalManagerFullName\tgeneralManagerFullName
generalManagerPhoneNumber1\tgeneralManagerPhoneNumber1
alarmSystemFeatures\talarmSystemFeatures
other6\tother6
automaticPoliceNotification\tautomaticPoliceNotification
breachNotificationProtocols\tbreachNotificationProtocols
maintenanceChecksFrequency\tmaintenanceChecksFrequency
shareAlarmSystemWithAnotherBusiness\tshareAlarmSystemWithAnotherBusiness
permitNumberForAlarmContractor\tpermitNumberForAlarmContractor
alarmSystemMaintenanceResponsibility\talarmSystemMaintenanceResponsibility
alarmSystemSharingMethod\talarmSystemSharingMethod
outsideEntranceExitDoorsDescription\toutsideEntranceExitDoorsDescription
insideDoorsDescription\tinsideDoorsDescription
cannabisStorageDoorsDescription\tcannabisStorageDoorsDescription
outsideEntranceExitLocksDescription\toutsideEntranceExitLocksDescription
insideLocksDescription\tinsideLocksDescription
cannabisStorageLocksDescription\tcannabisStorageLocksDescription
windowSecurityMethods\twindowSecurityMethods
cannabisProductStorageSecurityMethods\tcannabisProductStorageSecurityMethods
other8\tother8
additionalBusinessSecurityMethods\tadditionalBusinessSecurityMethods
surveillanceSystemProviderName\tsurveillanceSystemProviderName
videoResolution\tvideoResolution
framesPerSecond\tframesPerSecond
videoSystemMaintenanceChecksFrequency\tvideoSystemMaintenanceChecksFrequency
videoSystemContactFullName\tvideoSystemContactFullName
phoneVideoSystemContact\tphoneVideoSystemContact
recordingsDeviceAndLocationDescription\trecordingsDeviceAndLocationDescription
videoRecordingsSecurityMethods\tvideoRecordingsSecurityMethods
remoteRecordingStorageMethod\tremoteRecordingStorageMethod
surveillanceFootageRetentionPeriod\tsurveillanceFootageRetentionPeriod
shareVideoSurveillanceSystemWithAnotherBusiness\tshareVideoSurveillanceSystemWithAnotherBusiness
permitNumberForVideoSurveillanceContractor\tpermitNumberForVideoSurveillanceContractor
videoSurveillanceMaintenanceResponsibility\tvideoSurveillanceMaintenanceResponsibility
videoSurveillanceSharingMethod\tvideoSurveillanceSharingMethod
cannabisTransportationPlan\tcannabisTransportationPlan
transportVehicleSecurityFeatures\ttransportVehicleSecurityFeatures
other10\tother10
securityStaffFirearms\tsecurityStaffFirearms
transportSecurityStaffHiringMethod\ttransportSecurityStaffHiringMethod
transportContractingCompany\ttransportContractingCompany
transportSecurityContactFullName\ttransportSecurityContactFullName
phoneNumberOfTransportSecurityCompany\tphoneNumberOfTransportSecurityCompany
transportSecurityContractCopyUpload.{UPLOAD}.1\ttransportSecurityContractCopyUpload
securityPersonnelPresence\tsecurityPersonnelPresence
\tScreendoorStorefrontRetail
securityPersonnelHoursOnSite\tsecurityPersonnelHoursOnSite
listYourSecurityPersonnelByName.1.securityPersonnelListByName\tlistYourSecurityPersonnelByName1.securityPersonnelListByName
listYourSecurityPersonnelByName.1.licenseNumber\tlistYourSecurityPersonnelByName1.licenseNumber
listYourSecurityPersonnelByName.1.securityRole\tlistYourSecurityPersonnelByName1.securityRole
listYourSecurityPersonnelByName.1.willThisSecurityMemberCarryFirearms\tlistYourSecurityPersonnelByName1.willThisSecurityMemberCarryFirearms
listYourSecurityPersonnelByName.2.securityPersonnelListByName\tlistYourSecurityPersonnelByName2.securityPersonnelListByName
listYourSecurityPersonnelByName.2.licenseNumber\tlistYourSecurityPersonnelByName2.licenseNumber
listYourSecurityPersonnelByName.2.securityRole\tlistYourSecurityPersonnelByName2.securityRole
listYourSecurityPersonnelByName.2.willThisSecurityMemberCarryFirearms\tlistYourSecurityPersonnelByName2.willThisSecurityMemberCarryFirearms
listYourSecurityPersonnelByName.3.securityPersonnelListByName\tlistYourSecurityPersonnelByName3.securityPersonnelListByName
listYourSecurityPersonnelByName.3.licenseNumber\tlistYourSecurityPersonnelByName3.licenseNumber
listYourSecurityPersonnelByName.3.securityRole\tlistYourSecurityPersonnelByName3.securityRole
listYourSecurityPersonnelByName.3.willThisSecurityMemberCarryFirearms\tlistYourSecurityPersonnelByName3.willThisSecurityMemberCarryFirearms
securityPersonnelScreendoorOverflow\tsecurityPersonnelScreendoorOverflow
securityHiringMethod\tsecurityHiringMethod
securityContractingCompany\tsecurityContractingCompany
securityContactFullName\tsecurityContactFullName
securityContactPhoneNumber\tsecurityContactPhoneNumber
securityContractCopyUpload.{UPLOAD}.1\tsecurityContractCopyUpload
shareSecurityPersonnelWithAnotherBusiness\tshareSecurityPersonnelWithAnotherBusiness
permitNumberForSecurityContractor\tpermitNumberForSecurityContractor
securityPersonnelSharingMethod\tsecurityPersonnelSharingMethod
premisesDiagramUpload.{UPLOAD}.1\tpremisesDiagramUpload
securityPlanAndDiagramAcknowledgement\tsecurityPlanAndDiagramAcknowledgement
informationDeclarationUnderPenalty\tinformationDeclarationUnderPenalty
\tSecurity Plan Operators Section Notes
\tEmployee Badges Section Notes
\tAccess Section Notes
\tReporting Theft Section Notes
\tAlarm Provider Section Notes
\tAlarm System Section Notes
\tSecurity the Premises Section Notes
\tVideo Surveillance Section Notes
\tTransport Vehicle Security Section Notes
\tSecurity Personnel Section Notes
\tPremises Diagram Section Notes
\tLegal Agreements Section Notes
`,
		"Distributor": `
contractWithTransportSecurityCompany.{UPLOAD}.1\tcontractWithTransportSecurityCompany
`,
		"Cultivation": `
totalSquareFeetOfSpaceYouPlanOn\ttotalSquareFeetOfSpaceYouPlanOn
totalWattageUsedByYourLighting\ttotalWattageUsedByYourLighting
doYouPlanOnApplyingForANursery\tdoYouPlanOnApplyingForANursery
doYouPlanOnUsingAWaterSource\tdoYouPlanOnUsingAWaterSource
nameOfYourPlannedWaterSource\tnameOfYourPlannedWaterSource
nameOfYourPlannedWaterSupplier\tnameOfYourPlannedWaterSupplier
pointOfDiversionForYourWater\tpointOfDiversionForYourWater
selectAnyHazardousMaterialsYou\tselectAnyHazardousMaterialsYou
otherHazardousMaterial\totherHazardousMaterial
howWillYouStoreTheseMaterials\thowWillYouStoreTheseMaterials
selectTheInsecticidesYouPlanOn\tselectTheInsecticidesYouPlanOn
selectTheFungicidesAnd\tselectTheFungicidesAnd
selectTheRepellantsYouPlanOn\tselectTheRepellantsYouPlanOn
fertilizersDataGrid.1.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer1
fertilizersDataGrid.2.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer2
fertilizersDataGrid.3.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer3
fertilizersDataGrid.4.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer4
fertilizersDataGrid.5.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer5
fertilizersDataGrid.6.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer6
fertilizersDataGrid.7.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer7
fertilizersDataGrid.8.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer8
fertilizersDataGrid.9.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer9
fertilizersDataGrid.10.chemicalNameOfFertilizer\tfertilizersDataGrid.chemicalNameOfFertilizer10
ScreedoorChemicalOverflow\tScreedoorChemicalOverflow
describeHowYouWillDiluteAndStore\tdescribeHowYouWillDiluteAndStore
selectWhatYouPlanToUseWhen\tselectWhatYouPlanToUseWhen
otherGrowingMethod\totherGrowingMethod
selectTheMethodsOfPropagationYou\tselectTheMethodsOfPropagationYou
willYouUseCharcoalFiltersFor\twillYouUseCharcoalFiltersFor
describeOtherMethodsYouWillUseTo\tdescribeOtherMethodsYouWillUseTo
underPenaltyOfPerjuryIHereby\tunderPenaltyOfPerjuryIHereby
\tCanopy Space Section Notes
\tNursery Section Notes
\tWater Use Section Notes
\tHazardous Materials Section Notes
\tPesticides Section Notes
\tFertilizers Section Notes
\tPropagation Materials Section Notes
\tReducing Odors Section Notes
\tLegal Agreements Section Notes
`,
		"Delivery": `
firstName\tfirstName
lastName\tlastName
email\temail
DBAName\tDBAName
StreetAddress\tStreetAddress
\tScreendoorAddress
processOrdersForDelivery\tprocessOrdersForDelivery
stepsBeforeLeavingForDeliveries\tstepsBeforeLeavingForDeliveries
storeCannabisInVehicle\tstoreCannabisInVehicle
navigationSoftware\tnavigationSoftware
stepsBeforeHandingToCustomer\tstepsBeforeHandingToCustomer
stepsAfterDeliveries\tstepsAfterDeliveries
communicateWithBusiness\tcommunicateWithBusiness
otherCommunication\totherCommunication
mobileAppName\tmobileAppName
staffAllowedDuringDeliveries\tstaffAllowedDuringDeliveries
ensureStaffSafety\tensureStaffSafety
trainStaffOnCannabisLaws\ttrainStaffOnCannabisLaws
deliveryVehicleInformation.1.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber1
deliveryVehicleInformation.1.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance1
deliveryVehicleInformation.2.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber2
deliveryVehicleInformation.2.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance2
deliveryVehicleInformation.3.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber3
deliveryVehicleInformation.3.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance3
deliveryVehicleInformation.4.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber4
deliveryVehicleInformation.4.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance4
deliveryVehicleInformation.5.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber5
deliveryVehicleInformation.5.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance5
deliveryVehicleInformation.6.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber6
deliveryVehicleInformation.6.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance6
deliveryVehicleInformation.7.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber7
deliveryVehicleInformation.7.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance7
deliveryVehicleInformation.8.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber8
deliveryVehicleInformation.8.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance8
deliveryVehicleInformation.9.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber9
deliveryVehicleInformation.9.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance9
deliveryVehicleInformation.10.vehicleIdentificationNumber\tdeliveryVehicleInformation.vehicleIdentificationNumber10
deliveryVehicleInformation.10.uploadProofOfAutomobileInsurance.{UPLOAD}.1\tdeliveryVehicleInformation.uploadProofOfAutomobileInsurance10
\tscreendoorVINOverflow
moreThanTenVehicles\tmoreThanTenVehicles
perjuryStatement\tperjuryStatement
acknowledgeManifestCreation\tacknowledgeManifestCreation
perjuryDeclaration\tperjuryDeclaration
\tProcessing Orders Section Notes
\tMaking Deliveries Section Notes
\tManaging Delivery Section Notes
\tManaging Delivery Staff Section Notes
\tLegal Agreements Section Notes
`,
		"Manufacturing": `
uploadPackagingDiagram.{UPLOAD}.1\tuploadPackagingDiagram
`,
		"Testing": `
uploadProofOfAccreditationOrApplication.{UPLOAD}.1\tuploadProofOfAccreditationOrApplication
`,
	};
	const entries = Object.values(mappings)
		.flat()
		.join("\n")
		.split("\n")
		.filter(line => line)
		.map((line) => line.split("\t"))
		.filter(([formio, airtable]) => formio && airtable && formio !== airtable)
		.map((mapping) => mapping.reverse());

	return Object.fromEntries(entries);
}
