{
const { GroupedArray, getRecordObjects } = utils();
const { getMapping } = mappings();
//const jsonata = getJsonata();

const ScreendoorTableName = "SCREENDOOR_BUSINESS_PERMIT";
const ScreendoorRevTableName = ScreendoorTableName + "_REV";
const ScreendoorFields = [
	"RESPONSE_ID",
	"RESPONSE_NUM",
	"RESPONSE_JSON",
	"AIRTABLE_JSON",
	"SUBMITTED_AT",
	"SCREENDOOR_FORM_ID",
];
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
	["9396", "Delivery", "biz", "Del"],
	["6428", "Manufacturing", "biz", "Mfg"],
	["6431", "Testing", "biz", "Test"],
	["6682", "Legal Help"],
	["8110", "Renewal", "biz", "Ren1"],
	["9026", "Renewal", "biz", "Ren2"],
	["9436", "Renewal", "biz", "Ren3"]
].reduce((result, [id, name, base, shortName]) => {
	const info = { id, name, base, shortName };

	result[id] = result[name] = info;
	shortName && (result[shortName] = info);

	return result;
}, {
	info(base)
	{
		return Object.values(this)
			.filter((form) => form.base === base);
	},

	names(base)
	{
		const names = Object.values(this)
			.filter((form) => form.base === base)
			.map(({ name }) => name);

		return [...new Set(names)];
	}
});

const screendoorTable = base.getTable(ScreendoorTableName);
const screendoorRevTable = base.getTable(ScreendoorRevTableName);

/*
const submissionsByForm = new GroupedArray();

(await getRecordObjects(screendoorTable, ScreendoorFields))
	.forEach((record) => submissionsByForm.push(Forms[record.SCREENDOOR_FORM_ID].shortName, record));

// TODO: convert this to a node script for faster debugging
const form = "Sec";
const mapping = getMapping(form);
const record = submissionsByForm.get(form)[0];
//console.log(submissionsByForm.get("Sec")[0]);

//console.log(mapping);
//console.log({ fields: JSON.parse(JSON.stringify(record)) });
//console.log({ fields: record });

console.log({ fields: {
	ffs: {
		blah: 42,
		bloop: {
			blorp: "derp",
			fu: record.RESPONSE_JSON.slice(0, 200)
		}
	}
	}});

const { RESPONSE_JSON, AIRTABLE_JSON } = record;
*/

const data = {
  "fields": {
      "RESPONSE_ID": 31333,
      "RESPONSE_NUM": 451,
"RESPONSE_JSON": "{\r\n  \"id\": 2566454,\r\n  \"sequential_id\": 451,\r\n  \"project_id\": 6360,\r\n  \"form_id\": 5887,\r\n  \"initial_response_id\": 2183934,\r\n  \"pretty_id\": \"ZZMO7rfovvRg\",\r\n  \"submitted_at\": \"2019-09-25T21:49:14.133Z\",\r\n  \"responses\": {\r\n    \"z4htbabm\": {\r\n      \"city\": \"SAN FRANCISCO\",\r\n      \"state\": \"California\",\r\n      \"street\": \"828 INNES AVE #110\",\r\n      \"country\": \"US\",\r\n      \"zipcode\": \"94124\"\r\n    },\r\n    \"yoxt4vif\": null,\r\n    \"if6yh661\": [\r\n      {\r\n        \"bq6nv905\": \"poshhandprivileged@gmail.com\",\r\n        \"g47xcv3s\": \"(415) 623-6459\",\r\n        \"vn1qdokf\": \"n/a\",\r\n        \"xbo8szii\": \"Owner\",\r\n        \"zm22vctb\": \"REESE BENTON\"\r\n      }\r\n    ],\r\n    \"b36mir1z\": null,\r\n    \"1kv9vow9\": null,\r\n    \"gdqntyei\": [\r\n      {\r\n        \"id\": \"wmGpNAeV3jnVn0fWpxAUqG8ChHNpyW05\",\r\n        \"filename\": \"poshgreencollective.com.pdf\"\r\n      }\r\n    ],\r\n    \"3ye1kk65\": null,\r\n    \"hg3mupx6\": null,\r\n    \"wd2luv7p\": [\r\n      {\r\n        \"id\": \"Dx8pk0UVmhUWY65c_f9lVRy92dsv4slr\",\r\n        \"filename\": \"badge_template.xlt\"\r\n      }\r\n    ],\r\n    \"nmmpuat0\": true,\r\n    \"5naqw8qu\": true\r\n  },\r\n  \"rating_aggregates\": {},\r\n  \"average_rating\": null,\r\n  \"num_ratings\": 0,\r\n  \"created_at\": \"2019-08-23T18:56:10.280Z\",\r\n  \"updated_at\": \"2019-11-19T23:21:07.320Z\",\r\n  \"status\": \"Follow up Form - Reviewed\",\r\n  \"labels\": [\r\n    \"Police(Security) - Reviewed\"\r\n  ],\r\n  \"responder_language\": \"en\",\r\n  \"responder\": {\r\n    \"name\": \"Cheresse Benton\",\r\n    \"email\": \"poshhandprivileged@gmail.com\"\r\n  },\r\n  \"deleted_at\": null,\r\n  \"submission_source\": {\r\n    \"type\": \"frontend\",\r\n    \"hostname\": \"forms.fm\"\r\n  }\r\n}"
} };
console.log(mapping.evaluate(data));

/*
if (!AIRTABLE_JSON) {
//	const data = JSON.parse(RESPONSE_JSON);
//console.log(data);
	const data = {
		fields: {
			...record,
			RESPONSE_JSON: JSON.stringify(JSON.parse(RESPONSE_JSON))
		}
	};

	console.log(mapping.evaluate(data));
//	console.log(mapping.evaluate({ fields: record }));
//	console.log(mapping.evaluate({ data: data }));
//	console.log(mapping.evaluate({ data: data.responses }));
//	console.log(mapping.evaluate(data.responses));
	console.log(mapping.errors());
}
*/

//const data = {
//	example: [
//			{value: 4},
//			{value: 7},
//			{value: 13}
//	]
//};
//
//const expression = jsonata("$sum(example.value)");
//const result = await expression.evaluate(data);  // returns 24
//
//console.log(result);
}

function mappings() {
	const jsonata = getJsonata();
	const mappings = {
		Sec: `
(
	$idToField := function($id) {
		(
			{
				"z4htbabm": "screendoorAddress",
				"if6yh661": "securityEmployees",
				"zm22vctb": "fullName",
				"xbo8szii": "jobTitle",
				"vn1qdokf": "responsibility",
				"g47xcv3s": "phoneNumber",
				"bq6nv905": "email",
				"wd2luv7p": "uploadEmployeeBadgeTemplate",
				"fd78h5mq": "handleBadgeAccessOnChange",
				"zxxlc88y": "handleBadgeAccessOnEnd",
				"spqhc1vm": "ensureAuthorizedAreaAccess",
				"u3w8xob8": "recordContractorVendorAccess",
				"n51yaqqz": "describeOnlineSystem",
				"2tt07et0": "uploadContractorVendorSignInTemplate",
				"hd10pt0m": "recordRetentionPeriod",
				"yz4rxulx": "sfpdDistrictStation",
				"ghbtoq3c": "preventCannabisGoodsDiversion",
				"r4rew5dv": "alarmCompanyName",
				"u3ozp01b": "licenseNumber",
				"bd2dmvo4": "businessAddressOfAlarmCompany",
				"asccnwrx": "businessPhoneNumber1",
				"p30wntlg": "generalManagerFullName",
				"ktr87itf": "generalManagerPhoneNumber1",
				"0ume7g8j": "alarmSystemFeatures",
				"t650mbax": "automaticPoliceNotification",
				"61z3lrr9": "breachNotificationProtocols",
				"2cyi6s5c": "maintenanceChecksFrequency",
				"1icz2h81": "shareAlarmSystemWithAnotherBusiness",
				"qhaeoa90": "permitNumberForAlarmContractor",
				"8xn5he6o": "alarmSystemMaintenanceResponsibility",
				"p1welsw7": "alarmSystemSharingMethod",
				"4zxlfaww": "outsideEntranceExitDoorsDescription",
				"osbam494": "insideDoorsDescription",
				"028o3mz9": "cannabisStorageDoorsDescription",
				"i1pcyy5y": "outsideEntranceExitLocksDescription",
				"5q8npi4v": "insideLocksDescription",
				"wso1wxkh": "cannabisStorageLocksDescription",
				"4s0oujjc": "windowSecurityMethods",
				"2jn0ho5v": "cannabisProductStorageSecurityMethods",
				"2j0pcz5m": "additionalBusinessSecurityMethods",
				"t58xmzzo": "surveillanceSystemProviderName",
				"132c7tuv": "videoResolution",
				"lw9fw9r6": "framesPerSecond",
				"3ig8184y": "videoSystemMaintenanceChecksFrequency",
				"o17hf963": "videoSystemContactFullName",
				"n0evast7": "phoneVideoSystemContact",
				"nwxcgjx9": "recordingsDeviceAndLocationDescription",
				"kmvz7a24": "videoRecordingsSecurityMethods",
				"o2w1wbrw": "remoteRecordingStorageMethod",
				"ywqbllc7": "surveillanceFootageRetentionPeriod",
				"bjjjcjhl": "shareVideoSurveillanceSystemWithAnotherBusiness",
				"mvmsfsv9": "permitNumberForVideoSurveillanceContractor",
				"qv7lp8vf": "videoSurveillanceMaintenanceResponsibility",
				"xxbscbjw": "videoSurveillanceSharingMethod",
				"qh39cxdq": "cannabisTransportationPlan",
				"03go57sc": "transportVehicleSecurityFeatures",
				"mym6jfy1": "securityStaffFirearms",
				"2rbymcjt": "transportSecurityStaffHiringMethod",
				"rne4hnlb": "transportContractingCompany",
				"wd3mg2t7": "transportSecurityContactFullName",
				"ieysk5sa": "phoneNumberOfTransportSecurityCompany",
				"qud85i7x": "transportSecurityContractCopyUpload",
				"veenb0fe": "ScreendoorStorefrontRetail",
				"5muk5e3e": "securityPersonnelHoursOnSite",
				"h6scg1or": "listYourSecurityPersonnelByName",
				"ab6shupe": "securityPersonnelListByName",
				"ovm8hcl3": "licenseNumber",
				"n8jqg5zh": "securityRole",
				"866of6dk": "willThisSecurityMemberCarryFirearms",
				"zjojadxk": "securityHiringMethod",
				"x0zv27wg": "securityContractingCompany",
				"9mam53q3": "securityContactFullName",
				"jp2ejc6i": "securityContactPhoneNumber",
				"d7wioe6h": "securityContractCopyUpload",
				"l8qijoqv": "shareSecurityPersonnelWithAnotherBusiness",
				"cgz7lj0w": "permitNumberForSecurityContractor",
				"zj52jmsk": "securityPersonnelSharingMethod",
				"5o3uokfa": "premisesDiagramUpload",
				"nmmpuat0": "securityPlanAndDiagramAcknowledgement",
				"5naqw8qu": "informationDeclarationUnderPenalty"
			} ~> $lookup($id)
		) & ""
	};
	$screendoorStrToAirtableStr := function($id, $str) {
		(
			{
				"spqhc1vm": {
					"Badge checks": "badgeChecks",
					"Keys or key fobs only for authorized staff": "authorizedStaffKeysOrFobs",
					"Keypad access": "keypadAccess"
				},
				"u3w8xob8": {
					"Online": "onlineAccess",
					"On paper": "paperAccess"
				},
				"ghbtoq3c": {
					"Lockable safe for inventory": "lockableSafeForInventory",
					"Time-lock safe for inventory": "timeLockSafeForInventory",
					"Inventory checking": "inventoryChecking",
					"Track and trace": "trackAndTrace",
					"Access to cannabis goods only for authorized staff": "authorizedStaffCannabisGoodsAccess"
				},
				"0ume7g8j": {
					"Motion detection sensors": "motionDetectionSensors",
					"Door break sensors": "doorBreakSensors",
					"Glass break sensors": "glassBreakSensors",
					"Access control": "accessControl",
					"Remote operation": "remoteOperation",
					"Panic button": "panicButton",
					"Wireless backup": "wirelessBackup",
					"Life safety alarms": "lifeSafetyAlarms"
				},
				"2jn0ho5v": {
					"Automatic locking doors": "automaticLockingDoors",
					"Keys or key fobs for authorized staff": "authorizedStaffKeysOrFobs2",
					"Keypad access": "keypadAccess2",
					"Security personnel": "securityPersonnel",
					"Life safety alarms": "lifeSafetyAlarms2"
				},
				"qh39cxdq": {
					"Yes; I have applied for a distributor license": "distributorLicenseApplied",
					"Yes; I have multiple retail licenses under the same owner": "multipleRetailLicenses",
					"No": "no"
				},
				"03go57sc": {
					"GPS tracking": "gpsTracking",
					"Locked cash box": "lockedCashBox",
					"Audible alarm system": "audibleAlarmSystem",
					"Motion detectors": "motionDetectors",
					"Pressure switches": "pressureSwitches",
					"Panic alarms": "panicAlarms",
					"Armored Vehicle": "armoredVehicle",
					"Video surveillance": "videoSurveillance2",
					"Licensed security staff": "licensedSecurityStaff"
				},
				"2rbymcjt": {
					"I am hiring security in-house": "inHouseSecurityHiring",
					"I am contracting out for security": "contractedSecurityHiring"
				},
				"veenb0fe": {
					"Yes, I am seeking storefront retail use": "storefrontRetailUseYes",
					"No, I am not seeking storefront retail use and I will not have security personnel": "storefrontRetailUseNo",
					"No, I am not seeking storefront retail use, but I will have security personnel anyway": "storefrontRetailUseNoButSecurityPersonnel"
				},
				"zjojadxk": {
					"I will hire security in-house": "inHouseSecurityHiring",
					"I will contract out for security": "contractedSecurityHiring"
				},
				"mym6jfy1": {
					"Yes, they will be armed": "armedSecurityStaff",
					"No, they will be unarmed": "unarmedSecurityStaff"
				},
				"866of6dk": {
					"Yes, they will be armed": "yes",
					"No, they will be unarmed": "no"
				},
				"t650mbax": {
					"Yes": "yes",
					"No": "no"
				},
				"1icz2h81": {
					"Yes, I will be sharing": "yes",
					"No, I will have my own": "no"
				},
				"bjjjcjhl": {
					"Yes, I will be sharing": "yes",
					"No, I will have my own": "no"
				},
				"l8qijoqv": {
					"Yes, I will be sharing": "yes",
					"No, I will hire or contract my own": "no"
				}
			}
				~> $lookup($id)
				~> $lookup($str)
		) & ""
	};
	$transformArrayOfSecurityEmployees := function($ary, $aryName) {
		$transformArrayOfObjectsToObject($ary[[0..4]], $aryName)
			~> $append(
				$count($ary) > 5
					? $transformSecurityEmployeeOverflow($ary, "screendoorEmployeeOverflow")
					: {}
			)
			~> $merge()
	};
	$transformArrayOfObjectsToObject := function($ary, $aryName) {
		$ary
			~> $map(function($el, $idx) {
				$el
					~> $each(function($v, $k) {(
						$v := $isCheckboxObject($v, $k)
							? $transformOptionsCheckbox($v, $k)
							: $v;
						{($aryName & ($idx+1) & "." & $idToField($k)): $v}
					)})
					~> $merge()
			})
			~> $merge()
	};
	$transformSecurityEmployeeOverflow := function($ary, $aryName) {
		{
			$aryName: $ary[[5..$count($ary)]]
				~> $map(function($el, $idx) {
					[$el.\`zm22vctb\`, $el.\`xbo8szii\`, $el.\`vn1qdokf\`, $el.\`g47xcv3s\`, $el.\`bq6nv905\`]
						~> $join(", ")
				})
				~> $join("\\n")
		}
	};
	$transformArrayOfSecurityPersonnel := function($ary, $aryName) {
		$transformArrayOfObjectsToObject($ary[[0..2]], $aryName)
			~> $append(
				$count($ary) > 3
					? $transformSecurityPersonnelOverflow($ary, "securityPersonnelScreendoorOverflow")
					: {}
			)
			~> $merge()
	};
	$buildSecurityPersonnelInfo := function($personnel){
		[$personnel.\`ab6shupe\`, $personnel.\`ovm8hcl3\`, $personnel.\`n8jqg5zh\`, $personnel.\`866of6dk\`.checked[0]]
			~> $map($string)
			~> $join(", ")
	};
	$transformSecurityPersonnelOverflow := function($ary, $aryName) {
		{
			$aryName: $ary[[3..$count($ary)]]
				~> $map(function($el, $idx) {
						$buildSecurityPersonnelInfo($el)
				})
				~> $join("\\n")
		}
	};
	$isRadioObject := function($obj, $objName) {
		$isCheckboxObject($obj) and
		$objName in [
			"u3w8xob8",
			"t650mbax",
			"1icz2h81",
			"bjjjcjhl",
			"qh39cxdq",
			"mym6jfy1",
			"2rbymcjt",
			"veenb0fe",
			"zjojadxk",
			"l8qijoqv"
		]
	};
	$transformRadioObjectToString := function($v, $k) {
		{$idToField($k): $screendoorStrToAirtableStr($k, $v.checked[0])}
	};
	$isCheckboxObject := function($obj) {
		$type($obj) = "object" and
		$type($obj.checked) = "array"
	};
	$transformCheckboxObjectToArrayAndString := function($v, $k) {(
		$otherName := {
			"spqhc1vm": "other2",
			"ghbtoq3c": "other4",
			"0ume7g8j": "other6",
			"2jn0ho5v": "other8"
		} ~> $lookup($k);
		{
			$idToField($k):
				$v.checked
					~> $map(function($el) {$screendoorStrToAirtableStr($k, $el)})
					~> $append($v.other_checked ? ["other"] : [])
		}
			~> $append(
				($otherName and $v.other_checked) ? {$otherName: $v.other_text} : {}
			)
			~> $merge()
	)};
	$transformOptionsCheckbox := function($v, $k) {(
			$translated_array := $v.checked
				~> $map(function($el){$screendoorStrToAirtableStr($k, $el)});
			$count($translated_array) > 0 ? $translated_array : undefined
	)};
	$isAddressObject := function($obj) {
		$type($obj) = "object" and
		$keys($obj)
			~> $filter(function($el) {
				$el in ["street", "city", "state", "country", "zipcode"]
			})
	};
	$transformAddressObjectToObjects := function($obj, $objName) {
		{
			($idToField($objName) & ".line1"): $obj.street,
			($idToField($objName) & ".line2"): "",
			($idToField($objName) & ".city"): $obj.city,
			($idToField($objName) & ".state"): $obj.state,
			($idToField($objName) & ".zip"): $obj.zipcode
		}
	};
	$transformAddressObjectToString := function($obj, $objName) {
		{
			$objName: [$obj.street, $obj.city, $obj.state, $obj.zipcode]
				~> $map(function($el) { $string($el) })
				~> $join(", ")
		}
	};
	$isFileUploadArray := function($ary) {
		$type($ary) = "array" and
		$sort($keys($ary[0])) = $sort(["id", "filename"])
	};
	$transformFileUploadArrayToUrl := function($ary, $aryName) {
		{$idToField($aryName): $ary ~> $map(function($v){$v.filename}) ~> $join("\\n")}
	};
	$filteredPassthrough := function($v, $k) {
		{$idToField($k): $v}
	};
	$transformResponsesToFormattedArray := function($obj) {
		$obj
			~> $sift(function($v, $k) { $idToField($k) and $v })
			~> $each(function($v, $k) {
				$k = "z4htbabm"
					? $transformAddressObjectToString($v, $idToField($k))
					: $k = "if6yh661"
					? $transformArrayOfSecurityEmployees($v, $idToField($k))
					: $k = "h6scg1or"
					? $transformArrayOfSecurityPersonnel($v, $idToField($k))
					: $isRadioObject($v, $k)
					? $transformRadioObjectToString($v, $k)
					: $isCheckboxObject($v, $k)
					? $transformCheckboxObjectToArrayAndString($v, $k)
					: $isAddressObject($v)
					? $transformAddressObjectToObjects($v, $k)
					: $isFileUploadArray($v)
					? $transformFileUploadArrayToUrl($v, $k)
					: $filteredPassthrough($v, $k)
			})
	};
	$responseJson := $eval(fields.RESPONSE_JSON);
	$nameArray := $responseJson.responder.name ~> $split(/\\s+/);

	{
		"RESPONSE_ID": $string(fields.RESPONSE_ID),
		"RESPONSE_NUM": $string(fields.RESPONSE_NUM),
		'SCREENDOOR_BUSINESS_PERMIT' : [fields.AIRTABLE_ID],
		'Initial Screendoor Response ID': $string($responseJson.initial_response_id),
		"Submitted": $responseJson.updated_at,
		"email": $responseJson.responder.email,
		"firstName": $nameArray[[0..($count($nameArray)-2)]] ~> $join(" "),
		"lastName": $nameArray[-1]
	}
		~> $spread()
		~> $append($transformResponsesToFormattedArray($responseJson.responses))
		~> $merge();
)
`,
	};

	function getMapping(
		formShortName)
	{
		return jsonata(mappings[formShortName]);
	}

	return {
		getMapping
	};
}

function getJsonata() {
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).jsonata=e()}}(function(){return function(){return function e(t,r,n){function a(o,s){if(!r[o]){if(!t[o]){var u="function"==typeof require&&require;if(!s&&u)return u(o,!0);if(i)return i(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var p=r[o]={exports:{}};t[o][0].call(p.exports,function(e){return a(t[o][1][e]||e)},p,p.exports,e,t,r,n)}return r[o].exports}for(var i="function"==typeof require&&require,o=0;o<n.length;o++)a(n[o]);return a}}()({1:[function(e,t,r){const n=e("./utils"),a=function(){"use strict";const e=n.stringToArray,t=["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],r=["Zeroth","First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth","Sixteenth","Seventeenth","Eighteenth","Nineteenth"],a=["Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety","Hundred"],i=["Thousand","Million","Billion","Trillion"];const o={};t.forEach(function(e,t){o[e.toLowerCase()]=t}),r.forEach(function(e,t){o[e.toLowerCase()]=t}),a.forEach(function(e,t){const r=e.toLowerCase();o[r]=10*(t+2),o[r.substring(0,e.length-1)+"ieth"]=o[r]}),o.hundredth=100,i.forEach(function(e,t){const r=e.toLowerCase(),n=Math.pow(10,3*(t+1));o[r]=n,o[r+"th"]=n});const s=[[1e3,"m"],[900,"cm"],[500,"d"],[400,"cd"],[100,"c"],[90,"xc"],[50,"l"],[40,"xl"],[10,"x"],[9,"ix"],[5,"v"],[4,"iv"],[1,"i"]],u={M:1e3,D:500,C:100,L:50,X:10,V:5,I:1};function c(e,t){if(void 0===e)return;return l(e=Math.floor(e),d(t))}const p={DECIMAL:"decimal",LETTERS:"letters",ROMAN:"roman",WORDS:"words",SEQUENCE:"sequence"},f={UPPER:"upper",LOWER:"lower",TITLE:"title"};function l(n,o){let u;const c=n<0;switch(n=Math.abs(n),o.primary){case p.LETTERS:u=function(e,t){for(var r=[],n=t.charCodeAt(0);e>0;)r.unshift(String.fromCharCode((e-1)%26+n)),e=Math.floor((e-1)/26);return r.join("")}(n,o.case===f.UPPER?"A":"a");break;case p.ROMAN:u=function e(t){for(var r=0;r<s.length;r++){const n=s[r];if(t>=n[0])return n[1]+e(t-n[0])}return""}(n),o.case===f.UPPER&&(u=u.toUpperCase());break;case p.WORDS:u=function(e,n){var o=function(e,n,s){var u="";if(e<=19)u=(n?" and ":"")+(s?r[e]:t[e]);else if(e<100){const t=Math.floor(e/10),r=e%10;u=(n?" and ":"")+a[t-2],r>0?u+="-"+o(r,!1,s):s&&(u=u.substring(0,u.length-1)+"ieth")}else if(e<1e3){const r=Math.floor(e/100),a=e%100;u=(n?", ":"")+t[r]+" Hundred",a>0?u+=o(a,!0,s):s&&(u+="th")}else{var c=Math.floor(Math.log10(e)/3);c>i.length&&(c=i.length);const t=Math.pow(10,3*c),r=Math.floor(e/t),a=e-r*t;u=(n?", ":"")+o(r,!1,!1)+" "+i[c-1],a>0?u+=o(a,!0,s):s&&(u+="th")}return u};return o(e,!1,n)}(n,o.ordinal),o.case===f.UPPER?u=u.toUpperCase():o.case===f.LOWER&&(u=u.toLowerCase());break;case p.DECIMAL:u=""+n;var l=o.mandatoryDigits-u.length;if(l>0){var h=new Array(l+1).join("0");u=h+u}if(48!==o.zeroCode&&(u=e(u).map(e=>String.fromCodePoint(e.codePointAt(0)+o.zeroCode-48)).join("")),o.regular){for(let e=Math.floor((u.length-1)/o.groupingSeparators.position);e>0;e--){const t=u.length-e*o.groupingSeparators.position;u=u.substr(0,t)+o.groupingSeparators.character+u.substr(t)}}else o.groupingSeparators.reverse().forEach(e=>{const t=u.length-e.position;u=u.substr(0,t)+e.character+u.substr(t)});if(o.ordinal){var d={1:"st",2:"nd",3:"rd"}[u[u.length-1]];(!d||u.length>1&&"1"===u[u.length-2])&&(d="th"),u+=d}break;case p.SEQUENCE:throw{code:"D3130",value:o.token}}return c&&(u="-"+u),u}const h=[48,1632,1776,1984,2406,2534,2662,2790,2918,3046,3174,3302,3430,3558,3664,3792,3872,4160,4240,6112,6160,6470,6608,6784,6800,6992,7088,7232,7248,42528,43216,43264,43472,43504,43600,44016,65296];function d(t){const r={type:"integer",primary:p.DECIMAL,case:f.LOWER,ordinal:!1};let n,a;const i=t.lastIndexOf(";");switch(-1===i?n=t:(n=t.substring(0,i),"o"===(a=t.substring(i+1))[0]&&(r.ordinal=!0)),n){case"A":r.case=f.UPPER;case"a":r.primary=p.LETTERS;break;case"I":r.case=f.UPPER;case"i":r.primary=p.ROMAN;break;case"W":r.case=f.UPPER,r.primary=p.WORDS;break;case"Ww":r.case=f.TITLE,r.primary=p.WORDS;break;case"w":r.primary=p.WORDS;break;default:{let t=null,a=0,i=0,o=[],s=0;if(e(n).map(e=>e.codePointAt(0)).reverse().forEach(e=>{let r=!1;for(let n=0;n<h.length;n++){const i=h[n];if(e>=i&&e<=i+9){if(r=!0,a++,s++,null===t)t=i;else if(i!==t)throw{code:"D3131"};break}}r||(35===e?(s++,i++):o.push({position:s,character:String.fromCodePoint(e)}))}),a>0){r.primary=p.DECIMAL,r.zeroCode=t,r.mandatoryDigits=a,r.optionalDigits=i;const e=function(e){if(0===e.length)return 0;const t=e[0].character;for(let r=1;r<e.length;r++)if(e[r].character!==t)return 0;const r=e.map(e=>e.position),n=function(e,t){return 0===t?e:n(t,e%t)},a=r.reduce(n);for(let e=1;e<=r.length;e++)if(-1===r.indexOf(e*a))return 0;return a}(o);e>0?(r.regular=!0,r.groupingSeparators={position:e,character:o[0].character}):(r.regular=!1,r.groupingSeparators=o)}else r.primary=p.SEQUENCE,r.token=n}}return r}const v={Y:"1",M:"1",D:"1",d:"1",F:"n",W:"1",w:"1",X:"1",x:"1",H:"1",h:"1",P:"n",m:"01",s:"01",f:"1",Z:"01:01",z:"01:01",C:"n",E:"n"};function g(e){var t=[];const r={type:"datetime",parts:t},n=function(r,n){if(n>r){let a=e.substring(r,n);a=a.split("]]").join("]"),t.push({type:"literal",value:a})}};for(var a=0,i=0;i<e.length;){if("["===e.charAt(i)){if("["===e.charAt(i+1)){n(a,i),t.push({type:"literal",value:"["}),a=i+=2;continue}if(n(a,i),a=i,-1===(i=e.indexOf("]",a)))throw{code:"D3135"};let r=e.substring(a+1,i);var o,s={type:"marker",component:(r=r.split(/\s+/).join("")).charAt(0)},u=r.lastIndexOf(",");if(-1!==u){const e=r.substring(u+1),t=e.indexOf("-");let n,a;const i=function(e){return void 0===e||"*"===e?void 0:parseInt(e)};-1===t?n=e:(n=e.substring(0,t),a=e.substring(t+1));const c={min:i(n),max:i(a)};s.width=c,o=r.substring(1,u)}else o=r.substring(1);if(1===o.length)s.presentation1=o;else if(o.length>1){var c=o.charAt(o.length-1);-1!=="atco".indexOf(c)?(s.presentation2=c,"o"===c&&(s.ordinal=!0),s.presentation1=o.substring(0,o.length-1)):s.presentation1=o}else s.presentation1=v[s.component];if(void 0===s.presentation1)throw{code:"D3132",value:s.component};if("n"===s.presentation1[0])s.names=f.LOWER;else if("N"===s.presentation1[0])"n"===s.presentation1[1]?s.names=f.TITLE:s.names=f.UPPER;else if(-1!=="YMDdFWwXxHhmsf".indexOf(s.component)){var p=s.presentation1;if(s.presentation2&&(p+=";"+s.presentation2),s.integerFormat=d(p),s.width&&void 0!==s.width.min&&s.integerFormat.mandatoryDigits<s.width.min&&(s.integerFormat.mandatoryDigits=s.width.min),-1!=="YMD".indexOf(s.component))if(s.n=-1,s.width&&void 0!==s.width.max)s.n=s.width.max,s.integerFormat.mandatoryDigits=s.n;else{var l=s.integerFormat.mandatoryDigits+s.integerFormat.optionalDigits;l>=2&&(s.n=l)}}"Z"!==s.component&&"z"!==s.component||(s.integerFormat=d(s.presentation1)),t.push(s),a=i+1}i++}return n(a,i),r}const m=["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],y=["January","February","March","April","May","June","July","August","September","October","November","December"],b=function(e){const t=Date.UTC(e.year,e.month);var r=new Date(t).getUTCDay();return 0===r&&(r=7),r>4?t+864e5*(8-r):t-864e5*(r-1)},w=function(e,t){return{year:e,month:t,nextMonth:function(){return 11===t?w(e+1,0):w(e,t+1)},previousMonth:function(){return 0===t?w(e-1,11):w(e,t-1)},nextYear:function(){return w(e+1,t)},previousYear:function(){return w(e-1,t)}}},k=function(e,t){return(t-e)/6048e5+1},x=(e,t)=>{let r;switch(t){case"Y":r=e.getUTCFullYear();break;case"M":r=e.getUTCMonth()+1;break;case"D":r=e.getUTCDate();break;case"d":r=(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate())-Date.UTC(e.getUTCFullYear(),0))/864e5+1;break;case"F":0===(r=e.getUTCDay())&&(r=7);break;case"W":{const t=w(e.getUTCFullYear(),0),n=b(t),a=Date.UTC(t.year,e.getUTCMonth(),e.getUTCDate());let i=k(n,a);if(i>52){a>=b(t.nextYear())&&(i=1)}else if(i<1){const e=b(t.previousYear());i=k(e,a)}r=Math.floor(i);break}case"w":{const t=w(e.getUTCFullYear(),e.getUTCMonth()),n=b(t),a=Date.UTC(t.year,t.month,e.getUTCDate());let i=k(n,a);if(i>4){a>=b(t.nextMonth())&&(i=1)}else if(i<1){const e=b(t.previousMonth());i=k(e,a)}r=Math.floor(i);break}case"X":{const t=w(e.getUTCFullYear(),0),n=b(t),a=b(t.nextYear()),i=e.getTime();r=i<n?t.year-1:i>=a?t.year+1:t.year;break}case"x":{const t=w(e.getUTCFullYear(),e.getUTCMonth()),n=b(t),a=t.nextMonth(),i=b(a),o=e.getTime();r=o<n?t.previousMonth().month+1:o>=i?a.month+1:t.month+1;break}case"H":r=e.getUTCHours();break;case"h":r=e.getUTCHours(),0===(r%=12)&&(r=12);break;case"P":r=e.getUTCHours()>=12?"pm":"am";break;case"m":r=e.getUTCMinutes();break;case"s":r=e.getUTCSeconds();break;case"f":r=e.getUTCMilliseconds();break;case"Z":case"z":break;case"C":case"E":r="ISO"}return r};let A=null;function E(e,t,r){var n=0,a=0;if(void 0!==r){const e=parseInt(r);n=Math.floor(e/100),a=e%100}let i;void 0===t?(null===A&&(A=g("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01].[f001][Z01:01t]")),i=A):i=g(t);const o=new Date(e+60*(60*n+a)*1e3);let s="";return i.parts.forEach(function(e){"literal"===e.type?s+=e.value:s+=function(e,t){var r=x(e,t.component);if(-1!=="YMDdFWwXxHhms".indexOf(t.component))if("Y"===t.component&&-1!==t.n&&(r%=Math.pow(10,t.n)),t.names){if("M"===t.component||"x"===t.component)r=y[r-1];else{if("F"!==t.component)throw{code:"D3133",value:t.component};r=m[r]}t.names===f.UPPER?r=r.toUpperCase():t.names===f.LOWER&&(r=r.toLowerCase()),t.width&&r.length>t.width.max&&(r=r.substring(0,t.width.max))}else r=l(r,t.integerFormat);else if("f"===t.component)r=l(r,t.integerFormat);else if("Z"===t.component||"z"===t.component){const e=100*n+a;if(t.integerFormat.regular)r=l(e,t.integerFormat);else{const i=t.integerFormat.mandatoryDigits;if(1===i||2===i)r=l(n,t.integerFormat),0!==a&&(r+=":"+c(a,"00"));else{if(3!==i&&4!==i)throw{code:"D3134",value:i};r=l(e,t.integerFormat)}}e>=0&&(r="+"+r),"z"===t.component&&(r="GMT"+r),0===e&&"t"===t.presentation2&&(r="Z")}return r}(o,e)}),s}function T(e){var t={};if("datetime"===e.type)t.type="datetime",t.parts=e.parts.map(function(e){var t={};if("literal"===e.type)t.regex=e.value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");else if("Z"===e.component||"z"===e.component){let r;Array.isArray(e.integerFormat.groupingSeparators)||(r=e.integerFormat.groupingSeparators),t.regex="","z"===e.component&&(t.regex="GMT"),t.regex+="[-+][0-9]+",r&&(t.regex+=r.character+"[0-9]+"),t.parse=function(t){"z"===e.component&&(t=t.substring(3));let n=0,a=0;if(r)n=Number.parseInt(t.substring(0,t.indexOf(r.character))),a=Number.parseInt(t.substring(t.indexOf(r.character)+1));else{t.length-1<=2?n=Number.parseInt(t):(n=Number.parseInt(t.substring(0,3)),a=Number.parseInt(t.substring(3)))}return 60*n+a}}else if(e.integerFormat)e.integerFormat.n=e.n,t=T(e.integerFormat);else{t.regex="[a-zA-Z]+";var r={};if("M"===e.component||"x"===e.component)y.forEach(function(t,n){e.width&&e.width.max?r[t.substring(0,e.width.max)]=n+1:r[t]=n+1});else if("F"===e.component)m.forEach(function(t,n){n>0&&(e.width&&e.width.max?r[t.substring(0,e.width.max)]=n:r[t]=n)});else{if("P"!==e.component)throw{code:"D3133",value:e.component};r={am:0,AM:0,pm:1,PM:1}}t.parse=function(e){return r[e]}}return t.component=e.component,t});else{t.type="integer";const r=e.case===f.UPPER;let n;switch(n=e.n&&e.n>0?0===e.optionalDigits?`{${e.n}}`:`{${e.n-e.optionalDigits},${e.n}}`:"+",e.primary){case p.LETTERS:t.regex=r?"[A-Z]+":"[a-z]+",t.parse=function(e){return function(e,t){for(var r=t.charCodeAt(0),n=0,a=0;a<e.length;a++)n+=(e.charCodeAt(e.length-a-1)-r+1)*Math.pow(26,a);return n}(e,r?"A":"a")};break;case p.ROMAN:t.regex=r?"[MDCLXVI]+":"[mdclxvi]+",t.parse=function(e){return function(e){for(var t=0,r=1,n=e.length-1;n>=0;n--){const a=e[n],i=u[a];i<r?t-=i:(r=i,t+=i)}return t}(r?e:e.toUpperCase())};break;case p.WORDS:t.regex="(?:"+Object.keys(o).concat("and","[\\-, ]").join("|")+")+",t.parse=function(e){return function(e){const t=e.split(/,\s|\sand\s|[\s\\-]/).map(e=>o[e]);let r=[0];return t.forEach(e=>{if(e<100){let t=r.pop();t>=1e3&&(r.push(t),t=0),r.push(t+e)}else r.push(r.pop()*e)}),r.reduce((e,t)=>e+t,0)}(e.toLowerCase())};break;case p.DECIMAL:t.regex=`[0-9]${n}`,e.ordinal&&(t.regex+="(?:th|st|nd|rd)"),t.parse=function(t){let r=t;return e.ordinal&&(r=t.substring(0,t.length-2)),e.regular?r=r.split(",").join(""):e.groupingSeparators.forEach(e=>{r=r.split(e.character).join("")}),48!==e.zeroCode&&(r=r.split("").map(t=>String.fromCodePoint(t.codePointAt(0)-e.zeroCode+48)).join("")),parseInt(r)};break;case p.SEQUENCE:throw{code:"D3130",value:e.token}}}return t}var D=new RegExp("^\\d{4}(-[01]\\d)*(-[0-3]\\d)*(T[0-2]\\d:[0-5]\\d:[0-5]\\d)*(\\.\\d+)?([+-][0-2]\\d:?[0-5]\\d|Z)?$");return{formatInteger:c,parseInteger:function(e,t){if(void 0===e)return;return T(d(t)).parse(e)},fromMillis:function(e,t,r){if(void 0!==e)return E.call(this,e,t,r)},toMillis:function(e,t){if(void 0!==e){if(void 0===t){if(!D.test(e))throw{stack:(new Error).stack,code:"D3110",value:e};return Date.parse(e)}return function(e,t){const r=T(g(t)),n="^"+r.parts.map(e=>"("+e.regex+")").join("")+"$";var a=new RegExp(n,"i").exec(e);if(null!==a){const e=161,t=130,n=84,o=72,s=23,u=47,c={};for(let e=1;e<a.length;e++){const t=r.parts[e-1];t.parse&&(c[t.component]=t.parse(a[e]))}if(0===Object.getOwnPropertyNames(c).length)return;let p=0;const f=e=>{p<<=1,p+=e?1:0},l=e=>!(~e&p||!(e&p));"YXMxWwdD".split("").forEach(e=>f(c[e]));const h=!l(e)&&l(t),d=l(n),v=!d&&l(o);p=0,"PHhmsf".split("").forEach(e=>f(c[e]));const g=!l(s)&&l(u),m=(h?"YD":d?"XxwF":v?"XWF":"YMD")+(g?"Phmsf":"Hmsf"),y=this.environment.timestamp;let b=!1,w=!1;if(m.split("").forEach(e=>{if(void 0===c[e])b?(c[e]=-1!=="MDd".indexOf(e)?1:0,w=!0):c[e]=x(y,e);else if(b=!0,w)throw{code:"D3136"}}),c.M>0?c.M-=1:c.M=0,h){const e=Date.UTC(c.Y,0),t=1e3*(c.d-1)*60*60*24,r=new Date(e+t);c.M=r.getUTCMonth(),c.D=r.getUTCDate()}if(d)throw{code:"D3136"};if(v)throw{code:"D3136"};g&&(c.H=12===c.h?0:c.h,1===c.P&&(c.H+=12));var i=Date.UTC(c.Y,c.M,c.D,c.H,c.m,c.s,c.f);return(c.Z||c.z)&&(i-=60*(c.Z||c.z)*1e3),i}}.call(this,e,t)}}}}();t.exports=a},{"./utils":6}],2:[function(e,t,r){(function(r){(function(){var n=e("./utils");const a=(()=>{"use strict";var e=n.isNumeric,t=n.isArrayOfStrings,a=n.isArrayOfNumbers,i=n.createSequence,o=n.isSequence,s=n.isFunction,u=n.isLambda,c=n.isPromise,p=n.getFunctionArity,f=n.isDeepEqual,l=n.stringToArray;function h(e,t,r){if(void 0!==e){var n=l(e),a=n.length;if(a+t<0&&(t=0),void 0!==r){if(r<=0)return"";var i=t>=0?t+r:a+t+r;return n.slice(t,i).join("")}return n.slice(t).join("")}}function d(e){if(void 0!==e)return l(e).length}async function v(e,t){var r=e.apply(this,[t]);if(c(r)&&(r=await r),r&&"number"!=typeof r.start&&"number"!==r.end&&!Array.isArray(r.groups)&&!s(r.next))throw{code:"T1010",stack:(new Error).stack};return r}function g(e,t){var r;if(void 0!==e){if(t){var n=e.toString().split("e");e=+(n[0]+"e"+(n[1]?+n[1]+t:t))}var a=(r=Math.round(e))-e;return.5===Math.abs(a)&&1===Math.abs(r%2)&&(r-=1),t&&(r=+((n=r.toString().split("e"))[0]+"e"+(n[1]?+n[1]-t:-t))),Object.is(r,-0)&&(r=0),r}}function m(t){if(void 0!==t){var r=!1;if(Array.isArray(t)){if(1===t.length)r=m(t[0]);else if(t.length>1){r=t.filter(function(e){return m(e)}).length>0}}else"string"==typeof t?t.length>0&&(r=!0):e(t)?0!==t&&(r=!0):null!==t&&"object"==typeof t?Object.keys(t).length>0&&(r=!0):"boolean"==typeof t&&!0===t&&(r=!0);return r}}function y(e,t,r,n){var a=[t],i=p(e);return i>=2&&a.push(r),i>=3&&a.push(n),a}function b(e,t){return void 0===e?t:void 0===t?e:(Array.isArray(e)||(e=i(e)),Array.isArray(t)||(t=[t]),e.concat(t))}return{sum:function(e){if(void 0!==e){var t=0;return e.forEach(function(e){t+=e}),t}},count:function(e){return void 0===e?0:e.length},max:function(e){if(void 0!==e&&0!==e.length)return Math.max.apply(Math,e)},min:function(e){if(void 0!==e&&0!==e.length)return Math.min.apply(Math,e)},average:function(e){if(void 0!==e&&0!==e.length){var t=0;return e.forEach(function(e){t+=e}),t/e.length}},string:function(t,r=!1){if(void 0!==t){var n;if("string"==typeof t)n=t;else if(s(t))n="";else{if("number"==typeof t&&!isFinite(t))throw{code:"D3001",value:t,stack:(new Error).stack};var a=r?2:0;Array.isArray(t)&&t.outerWrapper&&(t=t[0]),n=JSON.stringify(t,function(t,r){return null!=r&&r.toPrecision&&e(r)?Number(r.toPrecision(15)):r&&s(r)?"":r},a)}return n}},substring:h,substringBefore:function(e,t){if(void 0!==e){var r=e.indexOf(t);return r>-1?e.substr(0,r):e}},substringAfter:function(e,t){if(void 0!==e){var r=e.indexOf(t);return r>-1?e.substr(r+t.length):e}},lowercase:function(e){if(void 0!==e)return e.toLowerCase()},uppercase:function(e){if(void 0!==e)return e.toUpperCase()},length:d,trim:function(e){if(void 0!==e){var t=e.replace(/[ \t\n\r]+/gm," ");return" "===t.charAt(0)&&(t=t.substring(1))," "===t.charAt(t.length-1)&&(t=t.substring(0,t.length-1)),t}},pad:function(e,t,r){if(void 0!==e){var n;void 0!==r&&0!==r.length||(r=" ");var a=Math.abs(t)-d(e);if(a>0){var i=new Array(a+1).join(r);r.length>1&&(i=h(i,0,a)),n=t>0?e+i:i+e}else n=e;return n}},match:async function(e,t,r){if(void 0!==e){if(r<0)throw{stack:(new Error).stack,value:r,code:"D3040",index:3};var n=i();if(void 0===r||r>0){var a=0,o=await v(t,e);if(void 0!==o)for(;void 0!==o&&(void 0===r||a<r);)n.push({match:o.match,index:o.start,groups:o.groups}),o=await v(o.next),a++}return n}},contains:async function(e,t){if(void 0!==e){return"string"==typeof t?-1!==e.indexOf(t):void 0!==await v(t,e)}},replace:async function(e,t,r,n){if(void 0!==e){var a;if(""===t)throw{code:"D3010",stack:(new Error).stack,value:t,index:2};if(n<0)throw{code:"D3011",stack:(new Error).stack,value:n,index:4};a="string"==typeof r?function(e){for(var t="",n=0,a=r.indexOf("$",n);-1!==a&&n<r.length;){t+=r.substring(n,a),n=a+1;var i=r.charAt(n);if("$"===i)t+="$",n++;else if("0"===i)t+=e.match,n++;else{var o;if(o=0===e.groups.length?1:Math.floor(Math.log(e.groups.length)*Math.LOG10E)+1,a=parseInt(r.substring(n,n+o),10),o>1&&a>e.groups.length&&(a=parseInt(r.substring(n,n+o-1),10)),isNaN(a))t+="$";else{if(e.groups.length>0){var s=e.groups[a-1];void 0!==s&&(t+=s)}n+=a.toString().length}}a=r.indexOf("$",n)}return t+=r.substring(n)}:r;var i="",o=0;if(void 0===n||n>0){var s=0;if("string"==typeof t){for(var u=e.indexOf(t,o);-1!==u&&(void 0===n||s<n);)i+=e.substring(o,u),i+=r,o=u+t.length,s++,u=e.indexOf(t,o);i+=e.substring(o)}else{var p=await v(t,e);if(void 0!==p){for(;void 0!==p&&(void 0===n||s<n);){i+=e.substring(o,p.start);var f=a.apply(this,[p]);if(c(f)&&(f=await f),"string"!=typeof f)throw{code:"D3012",stack:(new Error).stack,value:f};i+=f,o=p.start+p.match.length,s++,p=await v(p.next)}i+=e.substring(o)}else i=e}}else i=e;return i}},split:async function(e,t,r){if(void 0!==e){if(r<0)throw{code:"D3020",stack:(new Error).stack,value:r,index:3};var n=[];if(void 0===r||r>0)if("string"==typeof t)n=e.split(t,r);else{var a=0,i=await v(t,e);if(void 0!==i){for(var o=0;void 0!==i&&(void 0===r||a<r);)n.push(e.substring(o,i.start)),o=i.end,i=await v(i.next),a++;(void 0===r||a<r)&&n.push(e.substring(o))}else n.push(e)}return n}},join:function(e,t){if(void 0!==e)return void 0===t&&(t=""),e.join(t)},formatNumber:function(e,t,r){if(void 0!==e){var n={"decimal-separator":".","grouping-separator":",","exponent-separator":"e",infinity:"Infinity","minus-sign":"-",NaN:"NaN",percent:"%","per-mille":"‰","zero-digit":"0",digit:"#","pattern-separator":";"};void 0!==r&&Object.keys(r).forEach(function(e){n[e]=r[e]});for(var a=[],i=n["zero-digit"].charCodeAt(0),o=i;o<i+10;o++)a.push(String.fromCharCode(o));var s=a.concat([n["decimal-separator"],n["exponent-separator"],n["grouping-separator"],n.digit,n["pattern-separator"]]),u=t.split(n["pattern-separator"]);if(u.length>2)throw{code:"D3080",stack:(new Error).stack};var c=u.map(function(e){var t,r,a,i,o=function(){for(var t,r=0;r<e.length;r++)if(t=e.charAt(r),-1!==s.indexOf(t)&&t!==n["exponent-separator"])return e.substring(0,r)}(),u=function(){for(var t,r=e.length-1;r>=0;r--)if(t=e.charAt(r),-1!==s.indexOf(t)&&t!==n["exponent-separator"])return e.substring(r+1)}(),c=e.substring(o.length,e.length-u.length),p=e.indexOf(n["exponent-separator"],o.length);-1===p||p>e.length-u.length?(t=c,r=void 0):(t=c.substring(0,p),r=c.substring(p+1));var f=t.indexOf(n["decimal-separator"]);return-1===f?(a=t,i=u):(a=t.substring(0,f),i=t.substring(f+1)),{prefix:o,suffix:u,activePart:c,mantissaPart:t,exponentPart:r,integerPart:a,fractionalPart:i,subpicture:e}});c.forEach(function(e){var t,r,i=e.subpicture,o=i.indexOf(n["decimal-separator"]);o!==i.lastIndexOf(n["decimal-separator"])&&(t="D3081"),i.indexOf(n.percent)!==i.lastIndexOf(n.percent)&&(t="D3082"),i.indexOf(n["per-mille"])!==i.lastIndexOf(n["per-mille"])&&(t="D3083"),-1!==i.indexOf(n.percent)&&-1!==i.indexOf(n["per-mille"])&&(t="D3084");var u=!1;for(r=0;r<e.mantissaPart.length;r++){var c=e.mantissaPart.charAt(r);if(-1!==a.indexOf(c)||c===n.digit){u=!0;break}}u||(t="D3085"),-1!==e.activePart.split("").map(function(e){return-1===s.indexOf(e)?"p":"a"}).join("").indexOf("p")&&(t="D3086"),-1!==o?i.charAt(o-1)!==n["grouping-separator"]&&i.charAt(o+1)!==n["grouping-separator"]||(t="D3087"):e.integerPart.charAt(e.integerPart.length-1)===n["grouping-separator"]&&(t="D3088"),-1!==i.indexOf(n["grouping-separator"]+n["grouping-separator"])&&(t="D3089");var p=e.integerPart.indexOf(n.digit);-1!==p&&e.integerPart.substring(0,p).split("").filter(function(e){return a.indexOf(e)>-1}).length>0&&(t="D3090"),-1!==(p=e.fractionalPart.lastIndexOf(n.digit))&&e.fractionalPart.substring(p).split("").filter(function(e){return a.indexOf(e)>-1}).length>0&&(t="D3091");var f="string"==typeof e.exponentPart;if(f&&e.exponentPart.length>0&&(-1!==i.indexOf(n.percent)||-1!==i.indexOf(n["per-mille"]))&&(t="D3092"),f&&(0===e.exponentPart.length||e.exponentPart.split("").filter(function(e){return-1===a.indexOf(e)}).length>0)&&(t="D3093"),t)throw{code:t,stack:(new Error).stack}});var p,f,l,h,d=c.map(function(e){var t=function(t,r){for(var i=[],o=t.indexOf(n["grouping-separator"]);-1!==o;){var s=(r?t.substring(0,o):t.substring(o)).split("").filter(function(e){return-1!==a.indexOf(e)||e===n.digit}).length;i.push(s),o=e.integerPart.indexOf(n["grouping-separator"],o+1)}return i},r=t(e.integerPart),i=function(e){if(0===e.length)return 0;for(var t=function(e,r){return 0===r?e:t(r,e%r)},r=e.reduce(t),n=1;n<=e.length;n++)if(-1===e.indexOf(n*r))return 0;return r}(r),o=t(e.fractionalPart,!0),s=e.integerPart.split("").filter(function(e){return-1!==a.indexOf(e)}).length,u=s,c=e.fractionalPart.split(""),p=c.filter(function(e){return-1!==a.indexOf(e)}).length,f=c.filter(function(e){return-1!==a.indexOf(e)||e===n.digit}).length,l="string"==typeof e.exponentPart;0===s&&0===f&&(l?(p=1,f=1):s=1),l&&0===s&&-1!==e.integerPart.indexOf(n.digit)&&(s=1),0===s&&0===p&&(p=1);var h=0;return l&&(h=e.exponentPart.split("").filter(function(e){return-1!==a.indexOf(e)}).length),{integerPartGroupingPositions:r,regularGrouping:i,minimumIntegerPartSize:s,scalingFactor:u,prefix:e.prefix,fractionalPartGroupingPositions:o,minimumFactionalPartSize:p,maximumFactionalPartSize:f,minimumExponentSize:h,suffix:e.suffix,picture:e.subpicture}}),v=n["minus-sign"],m=n["zero-digit"],y=n["decimal-separator"],b=n["grouping-separator"];if(1===d.length&&(d.push(JSON.parse(JSON.stringify(d[0]))),d[1].prefix=v+d[1].prefix),f=-1!==(p=e>=0?d[0]:d[1]).picture.indexOf(n.percent)?100*e:-1!==p.picture.indexOf(n["per-mille"])?1e3*e:e,0===p.minimumExponentSize)l=f;else{var w=Math.pow(10,p.scalingFactor),k=Math.pow(10,p.scalingFactor-1);for(l=f,h=0;l<k;)l*=10,h-=1;for(;l>w;)l/=10,h+=1}var x=function(e,t){var r=Math.abs(e).toFixed(t);return"0"!==m&&(r=r.split("").map(function(e){return e>="0"&&e<="9"?a[e.charCodeAt(0)-48]:e}).join("")),r},A=x(g(l,p.maximumFactionalPartSize),p.maximumFactionalPartSize),E=A.indexOf(".");for(-1===E?A+=y:A=A.replace(".",y);A.charAt(0)===m;)A=A.substring(1);for(;A.charAt(A.length-1)===m;)A=A.substring(0,A.length-1);E=A.indexOf(y);var T=p.minimumIntegerPartSize-E,D=p.minimumFactionalPartSize-(A.length-E-1);if(A=(T>0?new Array(T+1).join(m):"")+A,A+=D>0?new Array(D+1).join(m):"",E=A.indexOf(y),p.regularGrouping>0)for(var S=Math.floor((E-1)/p.regularGrouping),O=1;O<=S;O++)A=[A.slice(0,E-O*p.regularGrouping),b,A.slice(E-O*p.regularGrouping)].join("");else p.integerPartGroupingPositions.forEach(function(e){A=[A.slice(0,E-e),b,A.slice(E-e)].join(""),E++});if(E=A.indexOf(y),p.fractionalPartGroupingPositions.forEach(function(e){A=[A.slice(0,e+E+1),b,A.slice(e+E+1)].join("")}),E=A.indexOf(y),-1!==p.picture.indexOf(y)&&E!==A.length-1||(A=A.substring(0,A.length-1)),void 0!==h){var P=x(h,0);(T=p.minimumExponentSize-P.length)>0&&(P=new Array(T+1).join(m)+P),A=A+n["exponent-separator"]+(h<0?v:"")+P}return A=p.prefix+A+p.suffix}},formatBase:function(e,t){if(void 0!==e){if(e=g(e),(t=void 0===t?10:g(t))<2||t>36)throw{code:"D3100",stack:(new Error).stack,value:t};return e.toString(t)}},number:function(e){var t;if(void 0!==e){if("number"==typeof e)t=e;else if("string"==typeof e&&/^-?[0-9]+(\.[0-9]+)?([Ee][-+]?[0-9]+)?$/.test(e)&&!isNaN(parseFloat(e))&&isFinite(e))t=parseFloat(e);else if("string"==typeof e&&/^(0[xX][0-9A-Fa-f]+)|(0[oO][0-7]+)|(0[bB][0-1]+)$/.test(e))t=Number(e);else if(!0===e)t=1;else{if(!1!==e)throw{code:"D3030",value:e,stack:(new Error).stack,index:1};t=0}return t}},floor:function(e){if(void 0!==e)return Math.floor(e)},ceil:function(e){if(void 0!==e)return Math.ceil(e)},round:g,abs:function(e){if(void 0!==e)return Math.abs(e)},sqrt:function(e){if(void 0!==e){if(e<0)throw{stack:(new Error).stack,code:"D3060",index:1,value:e};return Math.sqrt(e)}},power:function(e,t){var r;if(void 0!==e){if(r=Math.pow(e,t),!isFinite(r))throw{stack:(new Error).stack,code:"D3061",index:1,value:e,exp:t};return r}},random:function(){return Math.random()},boolean:m,not:function(e){if(void 0!==e)return!m(e)},map:async function(e,t){if(void 0!==e){for(var r=i(),n=0;n<e.length;n++){var a=y(t,e[n],n,e),o=await t.apply(this,a);void 0!==o&&r.push(o)}return r}},zip:function(){for(var e=[],t=Array.prototype.slice.call(arguments),r=Math.min.apply(Math,t.map(function(e){return Array.isArray(e)?e.length:0})),n=0;n<r;n++){var a=t.map(e=>e[n]);e.push(a)}return e},filter:async function(e,t){if(void 0!==e){for(var r=i(),n=0;n<e.length;n++){var a=e[n],o=y(t,a,n,e);m(await t.apply(this,o))&&r.push(a)}return r}},single:async function(e,t){if(void 0!==e){for(var r,n=!1,a=0;a<e.length;a++){var i=e[a],o=!0;if(void 0!==t){var s=y(t,i,a,e);o=m(await t.apply(this,s))}if(o){if(n)throw{stack:(new Error).stack,code:"D3138",index:a};r=i,n=!0}}if(!n)throw{stack:(new Error).stack,code:"D3139"};return r}},foldLeft:async function(e,t,r){if(void 0!==e){var n,a,i=p(t);if(i<2)throw{stack:(new Error).stack,code:"D3050",index:1};for(void 0===r&&e.length>0?(n=e[0],a=1):(n=r,a=0);a<e.length;){var o=[n,e[a]];i>=3&&o.push(a),i>=4&&o.push(e),n=await t.apply(this,o),a++}return n}},sift:async function(e,t){var r={};for(var n in e){var a=e[n],i=y(t,a,n,e);m(await t.apply(this,i))&&(r[n]=a)}return 0===Object.keys(r).length&&(r=void 0),r},keys:function e(t){var r=i();if(Array.isArray(t)){var n={};t.forEach(function(t){e(t).forEach(function(e){n[e]=!0})}),r=e(n)}else null===t||"object"!=typeof t||u(t)||Object.keys(t).forEach(e=>r.push(e));return r},lookup:function e(t,r){var n;if(Array.isArray(t)){n=i();for(var a=0;a<t.length;a++){var o=e(t[a],r);void 0!==o&&(Array.isArray(o)?o.forEach(e=>n.push(e)):n.push(o))}}else null!==t&&"object"==typeof t&&(n=t[r]);return n},append:b,exists:function(e){return void 0!==e},spread:function e(t){var r=i();if(Array.isArray(t))t.forEach(function(t){r=b(r,e(t))});else if(null===t||"object"!=typeof t||u(t))r=t;else for(var n in t){var a={};a[n]=t[n],r.push(a)}return r},merge:function(e){if(void 0!==e){var t={};return e.forEach(function(e){for(var r in e)t[r]=e[r]}),t}},reverse:function(e){if(void 0!==e){if(e.length<=1)return e;for(var t=e.length,r=new Array(t),n=0;n<t;n++)r[t-n-1]=e[n];return r}},each:async function(e,t){var r=i();for(var n in e){var a=y(t,e[n],n,e),o=await t.apply(this,a);void 0!==o&&r.push(o)}return r},error:function(e){throw{code:"D3137",stack:(new Error).stack,message:e||"$error() function evaluated"}},assert:function(e,t){if(!e)throw{code:"D3141",stack:(new Error).stack,message:t||"$assert() statement failed"}},type:function(t){if(void 0!==t)return null===t?"null":e(t)?"number":"string"==typeof t?"string":"boolean"==typeof t?"boolean":Array.isArray(t)?"array":s(t)?"function":"object"},sort:async function(e,r){if(void 0!==e){if(e.length<=1)return e;var n;if(void 0===r){if(!a(e)&&!t(e))throw{stack:(new Error).stack,code:"D3070",index:1};n=async function(e,t){return e>t}}else n=r;var i=async function(e){if(!Array.isArray(e)||e.length<=1)return e;var t=Math.floor(e.length/2),r=e.slice(0,t),a=e.slice(t);return r=await i(r),a=await i(a),await async function(e,t){var r=async function(e,t,a){0===t.length?Array.prototype.push.apply(e,a):0===a.length?Array.prototype.push.apply(e,t):await n(t[0],a[0])?(e.push(a[0]),await r(e,t,a.slice(1))):(e.push(t[0]),await r(e,t.slice(1),a))},a=[];return await r(a,e,t),a}(r,a)};return await i(e)}},shuffle:function(e){if(void 0!==e){if(e.length<=1)return e;for(var t=new Array(e.length),r=0;r<e.length;r++){var n=Math.floor(Math.random()*(r+1));r!==n&&(t[r]=t[n]),t[n]=e[r]}return t}},distinct:function(e){if(void 0!==e){if(!Array.isArray(e)||e.length<=1)return e;for(var t=o(e)?i():[],r=0;r<e.length;r++){for(var n=e[r],a=!1,s=0;s<t.length;s++)if(f(n,t[s])){a=!0;break}a||t.push(n)}return t}},base64encode:function(e){if(void 0!==e)return("undefined"!=typeof window?window.btoa:function(e){return new r.Buffer.from(e,"binary").toString("base64")})(e)},base64decode:function(e){if(void 0!==e)return("undefined"!=typeof window?window.atob:function(e){return new r.Buffer.from(e,"base64").toString("binary")})(e)},encodeUrlComponent:function(e){if(void 0!==e){var t;try{t=encodeURIComponent(e)}catch(t){throw{code:"D3140",stack:(new Error).stack,value:e,functionName:"encodeUrlComponent"}}return t}},encodeUrl:function(e){if(void 0!==e){var t;try{t=encodeURI(e)}catch(t){throw{code:"D3140",stack:(new Error).stack,value:e,functionName:"encodeUrl"}}return t}},decodeUrlComponent:function(e){if(void 0!==e){var t;try{t=decodeURIComponent(e)}catch(t){throw{code:"D3140",stack:(new Error).stack,value:e,functionName:"decodeUrlComponent"}}return t}},decodeUrl:function(e){if(void 0!==e){var t;try{t=decodeURI(e)}catch(t){throw{code:"D3140",stack:(new Error).stack,value:e,functionName:"decodeUrl"}}return t}}}})();t.exports=a}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./utils":6}],3:[function(e,t,r){var n=e("./datetime"),a=e("./functions"),i=e("./utils"),o=e("./parser"),s=e("./signature"),u=function(){"use strict";var e=i.isNumeric,t=i.isArrayOfStrings,r=i.isArrayOfNumbers,u=i.createSequence,c=i.isSequence,p=i.isFunction,f=i.isLambda,l=i.isIterable,h=i.isPromise,d=i.getFunctionArity,v=i.isDeepEqual,g=F(null);async function m(r,n,i){var o,s=i.lookup("__evaluate_entry");switch(s&&await s(r,n,i),r.type){case"path":o=await async function(e,t,r){var n,a;n=Array.isArray(t)&&"variable"!==e.steps[0].type?t:u(t);for(var i=!1,o=void 0,s=0;s<e.steps.length;s++){var c=e.steps[s];if(c.tuple&&(i=!0),0===s&&c.consarray?a=await m(c,n,r):i?o=await k(c,n,o,r):a=await b(c,n,r,s===e.steps.length-1),!i&&(void 0===a||0===a.length))break;void 0===c.focus&&(n=a)}if(i)if(e.tuple)a=o;else for(a=u(),s=0;s<o.length;s++)a.push(o[s]["@"]);e.keepSingletonArray&&(Array.isArray(a)&&a.cons&&!a.sequence&&(a=u(a)),a.keepSingleton=!0);e.hasOwnProperty("group")&&(a=await E(e.group,i?o:a,r));return a}(r,n,i);break;case"binary":o=await async function(t,r,n){var i,o=await m(t.lhs,r,n),s=t.value,u=async()=>await m(t.rhs,r,n);if("and"===s||"or"===s)try{return await async function(e,t,r){var n,a=A(e);switch(r){case"and":n=a&&A(await t());break;case"or":n=a||A(await t())}return n}(o,u,s)}catch(e){throw e.position=t.position,e.token=s,e}var c=await u();try{switch(s){case"+":case"-":case"*":case"/":case"%":i=function(t,r,n){var a;if(void 0!==t&&!e(t))throw{code:"T2001",stack:(new Error).stack,value:t};if(void 0!==r&&!e(r))throw{code:"T2002",stack:(new Error).stack,value:r};if(void 0===t||void 0===r)return a;switch(n){case"+":a=t+r;break;case"-":a=t-r;break;case"*":a=t*r;break;case"/":a=t/r;break;case"%":a=t%r}return a}(o,c,s);break;case"=":case"!=":i=function(e,t,r){var n;if(void 0===e||void 0===t)return!1;switch(r){case"=":n=v(e,t);break;case"!=":n=!v(e,t)}return n}(o,c,s);break;case"<":case"<=":case">":case">=":i=function(e,t,r){var n,a=typeof e,i=typeof t;if("undefined"!==a&&"string"!==a&&"number"!==a||"undefined"!==i&&"string"!==i&&"number"!==i)throw{code:"T2010",stack:(new Error).stack,value:"string"!==a&&"number"!==a?e:t};if("undefined"===a||"undefined"===i)return;if(a!==i)throw{code:"T2009",stack:(new Error).stack,value:e,value2:t};switch(r){case"<":n=e<t;break;case"<=":n=e<=t;break;case">":n=e>t;break;case">=":n=e>=t}return n}(o,c,s);break;case"&":i=function(e,t){var r="",n="";void 0!==e&&(r=a.string(e));void 0!==t&&(n=a.string(t));return r.concat(n)}(o,c);break;case"..":i=function(e,t){var r;if(void 0!==e&&!Number.isInteger(e))throw{code:"T2003",stack:(new Error).stack,value:e};if(void 0!==t&&!Number.isInteger(t))throw{code:"T2004",stack:(new Error).stack,value:t};if(void 0===e||void 0===t)return r;if(e>t)return r;var n=t-e+1;if(n>1e7)throw{code:"D2014",stack:(new Error).stack,value:n};r=new Array(n);for(var a=e,i=0;a<=t;a++,i++)r[i]=a;return r.sequence=!0,r}(o,c);break;case"in":i=function(e,t){var r=!1;if(void 0===e||void 0===t)return!1;Array.isArray(t)||(t=[t]);for(var n=0;n<t.length;n++)if(t[n]===e){r=!0;break}return r}(o,c)}}catch(e){throw e.position=t.position,e.token=s,e}return i}(r,n,i);break;case"unary":o=await async function(t,r,n){var i;switch(t.value){case"-":if(void 0===(i=await m(t.expression,r,n)))i=void 0;else{if(!e(i))throw{code:"D1002",stack:(new Error).stack,position:t.position,token:t.value,value:i};i=-i}break;case"[":i=[];let u=await Promise.all(t.expressions.map(async(e,t)=>(n.isParallelCall=t>0,[e,await m(e,r,n)])));for(let e of u){var[o,s]=e;void 0!==s&&("["===o.value?i.push(s):i=a.append(i,s))}t.consarray&&Object.defineProperty(i,"cons",{enumerable:!1,configurable:!1,value:!0});break;case"{":i=await E(t,r,n)}return i}(r,n,i);break;case"name":o=function(e,t,r){return a.lookup(t,e.value)}(r,n);break;case"string":case"number":case"value":o=function(e){return e.value}(r);break;case"wildcard":o=function(e,t){var r=u();Array.isArray(t)&&t.outerWrapper&&t.length>0&&(t=t[0]);null!==t&&"object"==typeof t&&Object.keys(t).forEach(function(e){var n=t[e];Array.isArray(n)?(n=function e(t,r){void 0===r&&(r=[]);Array.isArray(t)?t.forEach(function(t){e(t,r)}):r.push(t);return r}(n),r=a.append(r,n)):r.push(n)});return r}(0,n);break;case"descendant":o=function(e,t){var r,n=u();void 0!==t&&(!function e(t,r){Array.isArray(t)||r.push(t);Array.isArray(t)?t.forEach(function(t){e(t,r)}):null!==t&&"object"==typeof t&&Object.keys(t).forEach(function(n){e(t[n],r)})}(t,n),r=1===n.length?n[0]:n);return r}(0,n);break;case"parent":o=i.lookup(r.slot.label);break;case"condition":o=await async function(e,t,r){var n,i=await m(e.condition,t,r);a.boolean(i)?n=await m(e.then,t,r):void 0!==e.else&&(n=await m(e.else,t,r));return n}(r,n,i);break;case"block":o=await async function(e,t,r){for(var n,a=F(r),i=0;i<e.expressions.length;i++)n=await m(e.expressions[i],t,a);return n}(r,n,i);break;case"bind":o=await async function(e,t,r){var n=await m(e.rhs,t,r);return r.bind(e.lhs.value,n),n}(r,n,i);break;case"regex":o=function(e){var t=new R.RegexEngine(e.value),r=function(n,a){var i;t.lastIndex=a||0;var o=t.exec(n);if(null!==o){if(i={match:o[0],start:o.index,end:o.index+o[0].length,groups:[]},o.length>1)for(var s=1;s<o.length;s++)i.groups.push(o[s]);i.next=function(){if(!(t.lastIndex>=n.length)){var a=r(n,t.lastIndex);if(a&&""===a.match)throw{code:"D1004",stack:(new Error).stack,position:e.position,value:e.value.source};return a}}}return i};return r}(r);break;case"function":o=await S(r,n,i);break;case"variable":o=function(e,t,r){var n;n=""===e.value?t&&t.outerWrapper?t[0]:t:r.lookup(e.value);return n}(r,n,i);break;case"lambda":o=function(e,t,r){var n={_jsonata_lambda:!0,input:t,environment:r,arguments:e.arguments,signature:e.signature,body:e.body};!0===e.thunk&&(n.thunk=!0);return n.apply=async function(e,a){return await O(n,a,t,e?e.environment:r)},n}(r,n,i);break;case"partial":o=await async function(e,t,r){for(var n,a=[],i=0;i<e.arguments.length;i++){var o=e.arguments[i];"operator"===o.type&&"?"===o.value?a.push(o):a.push(await m(o,t,r))}var s=await m(e.procedure,t,r);if(void 0===s&&"path"===e.procedure.type&&r.lookup(e.procedure.steps[0].value))throw{code:"T1007",stack:(new Error).stack,position:e.position,token:e.procedure.steps[0].value};if(f(s))n=M(s,a);else if(s&&!0===s._jsonata_function)n=C(s.implementation,a);else{if("function"!=typeof s)throw{code:"T1008",stack:(new Error).stack,position:e.position,token:"path"===e.procedure.type?e.procedure.steps[0].value:e.procedure.value};n=C(s,a)}return n}(r,n,i);break;case"apply":o=await async function(e,t,r){var n,a=await m(e.lhs,t,r);if("function"===e.rhs.type)n=await S(e.rhs,t,r,{context:a});else{var i=await m(e.rhs,t,r);if(!p(i))throw{code:"T2006",stack:(new Error).stack,position:e.position,value:i};if(p(a)){var o=await m(D,null,r);n=await O(o,[a,i],null,r)}else n=await O(i,[a],null,r)}return n}(r,n,i);break;case"transform":o=function(e,r,n){return U(async function(r){if(void 0!==r){var a=n.lookup("clone");if(!p(a))throw{code:"T2013",stack:(new Error).stack,position:e.position};var i=await O(a,[r],null,n),o=await m(e.pattern,i,n);if(void 0!==o){Array.isArray(o)||(o=[o]);for(var s=0;s<o.length;s++){var u=o[s],c=await m(e.update,u,n),f=typeof c;if("undefined"!==f){if("object"!==f||null===c||Array.isArray(c))throw{code:"T2011",stack:(new Error).stack,position:e.update.position,value:c};for(var l in c)u[l]=c[l]}if(void 0!==e.delete){var h=await m(e.delete,u,n);if(void 0!==h){var d=h;if(Array.isArray(h)||(h=[h]),!t(h))throw{code:"T2012",stack:(new Error).stack,position:e.delete.position,value:d};for(var v=0;v<h.length;v++)"object"==typeof u&&null!==u&&delete u[h[v]]}}}}return i}},"<(oa):o>")}(r,0,i)}if(Object.prototype.hasOwnProperty.call(r,"predicate"))for(var l=0;l<r.predicate.length;l++)o=await x(r.predicate[l].expr,o,i);"path"!==r.type&&Object.prototype.hasOwnProperty.call(r,"group")&&(o=await E(r.group,o,i));var h=i.lookup("__evaluate_exit");return h&&await h(r,n,i,o),o&&c(o)&&!o.tupleStream&&(r.keepArray&&(o.keepSingleton=!0),0===o.length?o=void 0:1===o.length&&(o=o.keepSingleton?o:o[0])),o}function y(e,t){var r=F(e);for(const e in t)r.bind(e,t[e]);return r}async function b(e,t,r,n){var a;if("sort"===e.type)return a=await T(e,t,r),e.stages&&(a=await w(e.stages,a,r)),a;a=u();for(var i=0;i<t.length;i++){var o=await m(e,t[i],r);if(e.stages)for(var s=0;s<e.stages.length;s++)o=await x(e.stages[s].expr,o,r);void 0!==o&&a.push(o)}var p=u();return n&&1===a.length&&Array.isArray(a[0])&&!c(a[0])?p=a[0]:a.forEach(function(e){!Array.isArray(e)||e.cons?p.push(e):e.forEach(e=>p.push(e))}),p}async function w(e,t,r){for(var n=t,a=0;a<e.length;a++){var i=e[a];switch(i.type){case"filter":n=await x(i.expr,n,r);break;case"index":for(var o=0;o<n.length;o++){n[o][i.value]=o}}}return n}async function k(e,t,r,n){var a;if("sort"===e.type){if(r)a=await T(e,r,n);else{var i=await T(e,t,n);(a=u()).tupleStream=!0;for(var o=0;o<i.length;o++){var s={"@":i[o]};s[e.index]=o,a.push(s)}}return e.stages&&(a=await w(e.stages,a,n)),a}(a=u()).tupleStream=!0;var c=n;void 0===r&&(r=t.map(e=>({"@":e})));for(var p=0;p<r.length;p++){c=y(n,r[p]);var f=await m(e,r[p]["@"],c);if(void 0!==f){Array.isArray(f)||(f=[f]);for(var l=0;l<f.length;l++)s={},Object.assign(s,r[p]),f.tupleStream?Object.assign(s,f[l]):(e.focus?(s[e.focus]=f[l],s["@"]=r[p]["@"]):s["@"]=f[l],e.index&&(s[e.index]=l),e.ancestor&&(s[e.ancestor.label]=r[p]["@"])),a.push(s)}}return e.stages&&(a=await w(e.stages,a,n)),a}async function x(t,n,i){var o=u();if(n&&n.tupleStream&&(o.tupleStream=!0),Array.isArray(n)||(n=u(n)),"number"===t.type){var s=Math.floor(t.value);s<0&&(s=n.length+s),void 0!==(c=n[s])&&(Array.isArray(c)?o=c:o.push(c))}else for(s=0;s<n.length;s++){var c,p=c=n[s],f=i;n.tupleStream&&(p=c["@"],f=y(i,c));var l=await m(t,p,f);e(l)&&(l=[l]),r(l)?l.forEach(function(e){var t=Math.floor(e);t<0&&(t=n.length+t),t===s&&o.push(c)}):a.boolean(l)&&o.push(c)}return o}function A(e){var t=a.boolean(e);return void 0!==t&&t}async function E(e,t,r){var n={},i={},o=!(!t||!t.tupleStream);Array.isArray(t)||(t=u(t)),0===t.length&&t.push(void 0);for(var s=0;s<t.length;s++)for(var c=t[s],p=o?y(r,c):r,f=0;f<e.lhs.length;f++){var l,h=e.lhs[f];if("string"!=typeof(l=await m(h[0],o?c["@"]:c,p))&&void 0!==l)throw{code:"T1003",stack:(new Error).stack,position:e.position,value:l};if(void 0!==l){var d={data:c,exprIndex:f};if(i.hasOwnProperty(l)){if(i[l].exprIndex!==f)throw{code:"D1009",stack:(new Error).stack,position:e.position,value:l};i[l].data=a.append(i[l].data,c)}else i[l]=d}}let v=await Promise.all(Object.keys(i).map(async(t,n)=>{let s=i[t];var u=s.data,c=r;if(o){var p=function(e){if(!Array.isArray(e))return e;var t={};Object.assign(t,e[0]);for(var r=1;r<e.length;r++)for(const n in e[r])t[n]=a.append(t[n],e[r][n]);return t}(s.data);u=p["@"],delete p["@"],c=y(r,p)}return r.isParallelCall=n>0,[t,await m(e.lhs[s.exprIndex][1],u,c)]}));for(let e of v){var[l,g]=await e;void 0!==g&&(n[l]=g)}return n}async function T(e,t,r){var n=t,i=!!t.tupleStream,o={environment:r,input:t};return await a.sort.apply(o,[n,async function(t,n){for(var a=0,o=0;0===a&&o<e.terms.length;o++){var s=e.terms[o],u=t,c=r;i&&(u=t["@"],c=y(r,t));var p=await m(s.expression,u,c);u=n,c=r,i&&(u=n["@"],c=y(r,n));var f=await m(s.expression,u,c),l=typeof p,h=typeof f;if("undefined"!==l)if("undefined"!==h){if("string"!==l&&"number"!==l||"string"!==h&&"number"!==h)throw{code:"T2008",stack:(new Error).stack,position:e.position,value:"string"!==l&&"number"!==l?p:f};if(l!==h)throw{code:"T2007",stack:(new Error).stack,position:e.position,value:p,value2:f};p!==f&&(a=p<f?-1:1,!0===s.descending&&(a=-a))}else a=-1;else a="undefined"===h?0:1}return 1===a}])}var D=o("function($f, $g) { function($x){ $g($f($x)) } }");async function S(e,t,r,n){var a,i=await m(e.procedure,t,r);if(void 0===i&&"path"===e.procedure.type&&r.lookup(e.procedure.steps[0].value))throw{code:"T1005",stack:(new Error).stack,position:e.position,token:e.procedure.steps[0].value};var o=[];void 0!==n&&o.push(n.context);for(var s=0;s<e.arguments.length;s++){const n=await m(e.arguments[s],t,r);if(p(n)){const e=async function(...e){return await O(n,e,null,r)};e.arity=d(n),o.push(e)}else o.push(n)}var u="path"===e.procedure.type?e.procedure.steps[0].value:e.procedure.value;try{"object"==typeof i&&(i.token=u,i.position=e.position),a=await O(i,o,t,r)}catch(t){throw t.position||(t.position=e.position),t.token||(t.token=u),t}return a}async function O(e,t,r,n){var a;for(a=await P(e,t,r,n);f(a)&&!0===a.thunk;){var i=await m(a.body.procedure,a.input,a.environment);"variable"===a.body.procedure.type&&(i.token=a.body.procedure.value),i.position=a.body.procedure.position;for(var o=[],s=0;s<a.body.arguments.length;s++)o.push(await m(a.body.arguments[s],a.input,a.environment));a=await P(i,o,r,n)}return a}async function P(e,t,r,n){var a;try{var i=t;if(e&&(i=function(e,t,r){if(void 0===e)return t;return e.validate(t,r)}(e.signature,t,r)),f(e))a=await async function(e,t){var r,n=F(e.environment);e.arguments.forEach(function(e,r){n.bind(e.value,t[r])}),r="function"==typeof e.body?await async function(e,t){var r=j(e).map(function(e){return t.lookup(e.trim())}),n={environment:t},a=e.apply(n,r);h(a)&&(a=await a);return a}(e.body,n):await m(e.body,e.input,n);return r}(e,i);else if(e&&!0===e._jsonata_function){var o={environment:n,input:r};a=e.implementation.apply(o,i),l(a)&&(a=a.next().value),h(a)&&(a=await a)}else{if("function"!=typeof e)throw{code:"T1006",stack:(new Error).stack};a=e.apply(r,i),h(a)&&(a=await a)}}catch(t){throw e&&(void 0===t.token&&void 0!==e.token&&(t.token=e.token),t.position=e.position),t}return a}function M(e,t){var r=F(e.environment),n=[];return e.arguments.forEach(function(e,a){var i=t[a];i&&"operator"===i.type&&"?"===i.value?n.push(e):r.bind(e.value,i)}),{_jsonata_lambda:!0,input:e.input,environment:r,arguments:n,body:e.body}}function C(e,t){var r=j(e),n="function("+(r=r.map(function(e){return"$"+e.trim()})).join(", ")+"){ _ }",a=o(n);return a.body=e,M(a,t)}function j(e){var t=e.toString();return/\(([^)]*)\)/.exec(t)[1].split(",")}function U(e,t){var r={_jsonata_function:!0,implementation:e};return void 0!==t&&(r.signature=s(t)),r}function F(e){var t={};return{bind:function(e,r){t[e]=r},lookup:function(r){var n;return t.hasOwnProperty(r)?n=t[r]:e&&(n=e.lookup(r)),n},timestamp:e?e.timestamp:null,async:!!e&&e.async,isParallelCall:!!e&&e.isParallelCall,global:e?e.global:{ancestry:[null]}}}g.bind("sum",U(a.sum,"<a<n>:n>")),g.bind("count",U(a.count,"<a:n>")),g.bind("max",U(a.max,"<a<n>:n>")),g.bind("min",U(a.min,"<a<n>:n>")),g.bind("average",U(a.average,"<a<n>:n>")),g.bind("string",U(a.string,"<x-b?:s>")),g.bind("substring",U(a.substring,"<s-nn?:s>")),g.bind("substringBefore",U(a.substringBefore,"<s-s:s>")),g.bind("substringAfter",U(a.substringAfter,"<s-s:s>")),g.bind("lowercase",U(a.lowercase,"<s-:s>")),g.bind("uppercase",U(a.uppercase,"<s-:s>")),g.bind("length",U(a.length,"<s-:n>")),g.bind("trim",U(a.trim,"<s-:s>")),g.bind("pad",U(a.pad,"<s-ns?:s>")),g.bind("match",U(a.match,"<s-f<s:o>n?:a<o>>")),g.bind("contains",U(a.contains,"<s-(sf):b>")),g.bind("replace",U(a.replace,"<s-(sf)(sf)n?:s>")),g.bind("split",U(a.split,"<s-(sf)n?:a<s>>")),g.bind("join",U(a.join,"<a<s>s?:s>")),g.bind("formatNumber",U(a.formatNumber,"<n-so?:s>")),g.bind("formatBase",U(a.formatBase,"<n-n?:s>")),g.bind("formatInteger",U(n.formatInteger,"<n-s:s>")),g.bind("parseInteger",U(n.parseInteger,"<s-s:n>")),g.bind("number",U(a.number,"<(nsb)-:n>")),g.bind("floor",U(a.floor,"<n-:n>")),g.bind("ceil",U(a.ceil,"<n-:n>")),g.bind("round",U(a.round,"<n-n?:n>")),g.bind("abs",U(a.abs,"<n-:n>")),g.bind("sqrt",U(a.sqrt,"<n-:n>")),g.bind("power",U(a.power,"<n-n:n>")),g.bind("random",U(a.random,"<:n>")),g.bind("boolean",U(a.boolean,"<x-:b>")),g.bind("not",U(a.not,"<x-:b>")),g.bind("map",U(a.map,"<af>")),g.bind("zip",U(a.zip,"<a+>")),g.bind("filter",U(a.filter,"<af>")),g.bind("single",U(a.single,"<af?>")),g.bind("reduce",U(a.foldLeft,"<afj?:j>")),g.bind("sift",U(a.sift,"<o-f?:o>")),g.bind("keys",U(a.keys,"<x-:a<s>>")),g.bind("lookup",U(a.lookup,"<x-s:x>")),g.bind("append",U(a.append,"<xx:a>")),g.bind("exists",U(a.exists,"<x:b>")),g.bind("spread",U(a.spread,"<x-:a<o>>")),g.bind("merge",U(a.merge,"<a<o>:o>")),g.bind("reverse",U(a.reverse,"<a:a>")),g.bind("each",U(a.each,"<o-f:a>")),g.bind("error",U(a.error,"<s?:x>")),g.bind("assert",U(a.assert,"<bs?:x>")),g.bind("type",U(a.type,"<x:s>")),g.bind("sort",U(a.sort,"<af?:a>")),g.bind("shuffle",U(a.shuffle,"<a:a>")),g.bind("distinct",U(a.distinct,"<x:x>")),g.bind("base64encode",U(a.base64encode,"<s-:s>")),g.bind("base64decode",U(a.base64decode,"<s-:s>")),g.bind("encodeUrlComponent",U(a.encodeUrlComponent,"<s-:s>")),g.bind("encodeUrl",U(a.encodeUrl,"<s-:s>")),g.bind("decodeUrlComponent",U(a.decodeUrlComponent,"<s-:s>")),g.bind("decodeUrl",U(a.decodeUrl,"<s-:s>")),g.bind("eval",U(async function(e,t){if(void 0!==e){var r=this.input;void 0!==t&&(r=t,Array.isArray(r)&&!c(r)&&((r=u(r)).outerWrapper=!0));try{var n=o(e,!1)}catch(e){throw I(e),{stack:(new Error).stack,code:"D3120",value:e.message,error:e}}try{var a=await m(n,r,this.environment)}catch(e){throw I(e),{stack:(new Error).stack,code:"D3121",value:e.message,error:e}}return a}},"<sx?:x>")),g.bind("toMillis",U(n.toMillis,"<s-s?:n>")),g.bind("fromMillis",U(n.fromMillis,"<n-s?s?:s>")),g.bind("clone",U(function(e){if(void 0!==e)return JSON.parse(a.string(e))},"<(oa)-:o>"));var N={S0101:"String literal must be terminated by a matching quote",S0102:"Number out of range: {{token}}",S0103:"Unsupported escape sequence: \\{{token}}",S0104:"The escape sequence \\u must be followed by 4 hex digits",S0105:"Quoted property name must be terminated with a backquote (`)",S0106:"Comment has no closing tag",S0201:"Syntax error: {{token}}",S0202:"Expected {{value}}, got {{token}}",S0203:"Expected {{value}} before end of expression",S0204:"Unknown operator: {{token}}",S0205:"Unexpected token: {{token}}",S0206:"Unknown expression type: {{token}}",S0207:"Unexpected end of expression",S0208:"Parameter {{value}} of function definition must be a variable name (start with $)",S0209:"A predicate cannot follow a grouping expression in a step",S0210:"Each step can only have one grouping expression",S0211:"The symbol {{token}} cannot be used as a unary operator",S0212:"The left side of := must be a variable name (start with $)",S0213:"The literal value {{value}} cannot be used as a step within a path expression",S0214:"The right side of {{token}} must be a variable name (start with $)",S0215:"A context variable binding must precede any predicates on a step",S0216:"A context variable binding must precede the 'order-by' clause on a step",S0217:"The object representing the 'parent' cannot be derived from this expression",S0301:"Empty regular expressions are not allowed",S0302:"No terminating / in regular expression",S0402:"Choice groups containing parameterized types are not supported",S0401:"Type parameters can only be applied to functions and arrays",S0500:"Attempted to evaluate an expression containing syntax error(s)",T0410:"Argument {{index}} of function {{token}} does not match function signature",T0411:"Context value is not a compatible type with argument {{index}} of function {{token}}",T0412:"Argument {{index}} of function {{token}} must be an array of {{type}}",D1001:"Number out of range: {{value}}",D1002:"Cannot negate a non-numeric value: {{value}}",T1003:"Key in object structure must evaluate to a string; got: {{value}}",D1004:"Regular expression matches zero length string",T1005:"Attempted to invoke a non-function. Did you mean ${{{token}}}?",T1006:"Attempted to invoke a non-function",T1007:"Attempted to partially apply a non-function. Did you mean ${{{token}}}?",T1008:"Attempted to partially apply a non-function",D1009:"Multiple key definitions evaluate to same key: {{value}}",T1010:"The matcher function argument passed to function {{token}} does not return the correct object structure",T2001:"The left side of the {{token}} operator must evaluate to a number",T2002:"The right side of the {{token}} operator must evaluate to a number",T2003:"The left side of the range operator (..) must evaluate to an integer",T2004:"The right side of the range operator (..) must evaluate to an integer",D2005:"The left side of := must be a variable name (start with $)",T2006:"The right side of the function application operator ~> must be a function",T2007:"Type mismatch when comparing values {{value}} and {{value2}} in order-by clause",T2008:"The expressions within an order-by clause must evaluate to numeric or string values",T2009:"The values {{value}} and {{value2}} either side of operator {{token}} must be of the same data type",T2010:"The expressions either side of operator {{token}} must evaluate to numeric or string values",T2011:"The insert/update clause of the transform expression must evaluate to an object: {{value}}",T2012:"The delete clause of the transform expression must evaluate to a string or array of strings: {{value}}",T2013:"The transform expression clones the input object using the $clone() function.  This has been overridden in the current scope by a non-function.",D2014:"The size of the sequence allocated by the range operator (..) must not exceed 1e6.  Attempted to allocate {{value}}.",D3001:"Attempting to invoke string function on Infinity or NaN",D3010:"Second argument of replace function cannot be an empty string",D3011:"Fourth argument of replace function must evaluate to a positive number",D3012:"Attempted to replace a matched string with a non-string value",D3020:"Third argument of split function must evaluate to a positive number",D3030:"Unable to cast value to a number: {{value}}",D3040:"Third argument of match function must evaluate to a positive number",D3050:"The second argument of reduce function must be a function with at least two arguments",D3060:"The sqrt function cannot be applied to a negative number: {{value}}",D3061:"The power function has resulted in a value that cannot be represented as a JSON number: base={{value}}, exponent={{exp}}",D3070:"The single argument form of the sort function can only be applied to an array of strings or an array of numbers.  Use the second argument to specify a comparison function",D3080:"The picture string must only contain a maximum of two sub-pictures",D3081:"The sub-picture must not contain more than one instance of the 'decimal-separator' character",D3082:"The sub-picture must not contain more than one instance of the 'percent' character",D3083:"The sub-picture must not contain more than one instance of the 'per-mille' character",D3084:"The sub-picture must not contain both a 'percent' and a 'per-mille' character",D3085:"The mantissa part of a sub-picture must contain at least one character that is either an 'optional digit character' or a member of the 'decimal digit family'",D3086:"The sub-picture must not contain a passive character that is preceded by an active character and that is followed by another active character",D3087:"The sub-picture must not contain a 'grouping-separator' character that appears adjacent to a 'decimal-separator' character",D3088:"The sub-picture must not contain a 'grouping-separator' at the end of the integer part",D3089:"The sub-picture must not contain two adjacent instances of the 'grouping-separator' character",D3090:"The integer part of the sub-picture must not contain a member of the 'decimal digit family' that is followed by an instance of the 'optional digit character'",D3091:"The fractional part of the sub-picture must not contain an instance of the 'optional digit character' that is followed by a member of the 'decimal digit family'",D3092:"A sub-picture that contains a 'percent' or 'per-mille' character must not contain a character treated as an 'exponent-separator'",D3093:"The exponent part of the sub-picture must comprise only of one or more characters that are members of the 'decimal digit family'",D3100:"The radix of the formatBase function must be between 2 and 36.  It was given {{value}}",D3110:"The argument of the toMillis function must be an ISO 8601 formatted timestamp. Given {{value}}",D3120:"Syntax error in expression passed to function eval: {{value}}",D3121:"Dynamic error evaluating the expression passed to function eval: {{value}}",D3130:"Formatting or parsing an integer as a sequence starting with {{value}} is not supported by this implementation",D3131:"In a decimal digit pattern, all digits must be from the same decimal group",D3132:"Unknown component specifier {{value}} in date/time picture string",D3133:"The 'name' modifier can only be applied to months and days in the date/time picture string, not {{value}}",D3134:"The timezone integer format specifier cannot have more than four digits",D3135:"No matching closing bracket ']' in date/time picture string",D3136:"The date/time picture string is missing specifiers required to parse the timestamp",D3137:"{{{message}}}",D3138:"The $single() function expected exactly 1 matching result.  Instead it matched more.",D3139:"The $single() function expected exactly 1 matching result.  Instead it matched 0.",D3140:"Malformed URL passed to ${{{functionName}}}(): {{value}}",D3141:"{{{message}}}"};function I(e){var t=N[e.code];if(void 0!==t){var r=t.replace(/\{\{\{([^}]+)}}}/g,function(){return e[arguments[1]]});r=r.replace(/\{\{([^}]+)}}/g,function(){return JSON.stringify(e[arguments[1]])}),e.message=r}}function R(e,t){var r,a;try{r=o(e,t&&t.recover),a=r.errors,delete r.errors}catch(e){throw I(e),e}var i=F(g),s=new Date;return i.bind("now",U(function(e,t){return n.fromMillis(s.getTime(),e,t)},"<s?s?:s>")),i.bind("millis",U(function(){return s.getTime()},"<:n>")),t&&t.RegexEngine?R.RegexEngine=t.RegexEngine:R.RegexEngine=RegExp,{evaluate:async function(e,t,n){if(void 0!==a){var o={code:"S0500",position:0};throw I(o),o}var p,f;if(void 0!==t)for(var l in p=F(i),t)p.bind(l,t[l]);else p=i;p.bind("$",e),s=new Date,p.timestamp=s,Array.isArray(e)&&!c(e)&&((e=u(e)).outerWrapper=!0);try{return f=await m(r,e,p),"function"==typeof n&&n(null,f),f}catch(o){throw I(o),o}},assign:function(e,t){i.bind(e,t)},registerFunction:function(e,t,r){var n=U(t,r);i.bind(e,n)},ast:function(){return r},errors:function(){return a}}}return R.parser=o,R}();t.exports=u},{"./datetime":1,"./functions":2,"./parser":4,"./signature":5,"./utils":6}],4:[function(e,t,r){var n=e("./signature");const a=(()=>{"use strict";var e={".":75,"[":80,"]":0,"{":70,"}":0,"(":80,")":0,",":0,"@":80,"#":80,";":80,":":80,"?":20,"+":50,"-":50,"*":60,"/":60,"%":60,"|":20,"=":40,"<":40,">":40,"^":40,"**":60,"..":20,":=":10,"!=":40,"<=":40,">=":40,"~>":40,and:30,or:25,in:40,"&":50,"!":0,"~":0},t={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},r=function(r){var n=0,a=r.length,i=function(e,t){return{type:e,value:t,position:n}},o=function(s){if(n>=a)return null;for(var u=r.charAt(n);n<a&&" \t\n\r\v".indexOf(u)>-1;)n++,u=r.charAt(n);if("/"===u&&"*"===r.charAt(n+1)){var c=n;for(n+=2,u=r.charAt(n);"*"!==u||"/"!==r.charAt(n+1);)if(u=r.charAt(++n),n>=a)throw{code:"S0106",stack:(new Error).stack,position:c};return n+=2,u=r.charAt(n),o(s)}if(!0!==s&&"/"===u)return n++,i("regex",function(){for(var e,t,i=n,o=0,s=function(e){if("/"===r.charAt(e)&&0===o){for(var t=0;"\\"===r.charAt(e-(t+1));)t++;if(t%2==0)return!0}return!1};n<a;){var u=r.charAt(n);if(s(n)){if(""===(e=r.substring(i,n)))throw{code:"S0301",stack:(new Error).stack,position:n};for(n++,u=r.charAt(n),i=n;"i"===u||"m"===u;)n++,u=r.charAt(n);return t=r.substring(i,n)+"g",new RegExp(e,t)}"("!==u&&"["!==u&&"{"!==u||"\\"===r.charAt(n-1)||o++,")"!==u&&"]"!==u&&"}"!==u||"\\"===r.charAt(n-1)||o--,n++}throw{code:"S0302",stack:(new Error).stack,position:n}}());if("."===u&&"."===r.charAt(n+1))return n+=2,i("operator","..");if(":"===u&&"="===r.charAt(n+1))return n+=2,i("operator",":=");if("!"===u&&"="===r.charAt(n+1))return n+=2,i("operator","!=");if(">"===u&&"="===r.charAt(n+1))return n+=2,i("operator",">=");if("<"===u&&"="===r.charAt(n+1))return n+=2,i("operator","<=");if("*"===u&&"*"===r.charAt(n+1))return n+=2,i("operator","**");if("~"===u&&">"===r.charAt(n+1))return n+=2,i("operator","~>");if(Object.prototype.hasOwnProperty.call(e,u))return n++,i("operator",u);if('"'===u||"'"===u){var p=u;n++;for(var f="";n<a;){if("\\"===(u=r.charAt(n)))if(n++,u=r.charAt(n),Object.prototype.hasOwnProperty.call(t,u))f+=t[u];else{if("u"!==u)throw{code:"S0103",stack:(new Error).stack,position:n,token:u};var l=r.substr(n+1,4);if(!/^[0-9a-fA-F]+$/.test(l))throw{code:"S0104",stack:(new Error).stack,position:n};var h=parseInt(l,16);f+=String.fromCharCode(h),n+=4}else{if(u===p)return n++,i("string",f);f+=u}n++}throw{code:"S0101",stack:(new Error).stack,position:n}}var d,v=/^-?(0|([1-9][0-9]*))(\.[0-9]+)?([Ee][-+]?[0-9]+)?/.exec(r.substring(n));if(null!==v){var g=parseFloat(v[0]);if(!isNaN(g)&&isFinite(g))return n+=v[0].length,i("number",g);throw{code:"S0102",stack:(new Error).stack,position:n,token:v[0]}}if("`"===u){n++;var m=r.indexOf("`",n);if(-1!==m)return d=r.substring(n,m),n=m+1,i("name",d);throw n=a,{code:"S0105",stack:(new Error).stack,position:n}}for(var y,b=n;;)if(y=r.charAt(b),b===a||" \t\n\r\v".indexOf(y)>-1||Object.prototype.hasOwnProperty.call(e,y)){if("$"===r.charAt(n))return d=r.substring(n+1,b),n=b,i("variable",d);switch(d=r.substring(n,b),n=b,d){case"or":case"in":case"and":return i("operator",d);case"true":return i("value",!0);case"false":return i("value",!1);case"null":return i("value",null);default:return n===a&&""===d?null:i("name",d)}}else b++};return o};return function(t,a){var i,o,s={},u=[],c=function(){var e=[];"(end)"!==i.id&&e.push({type:i.type,value:i.value,position:i.position});for(var t=o();null!==t;)e.push(t),t=o();return e},p={nud:function(){var e={code:"S0211",token:this.value,position:this.position};if(a)return e.remaining=c(),e.type="error",u.push(e),e;throw e.stack=(new Error).stack,e}},f=function(e,t){var r=s[e];return t=t||0,r?t>=r.lbp&&(r.lbp=t):((r=Object.create(p)).id=r.value=e,r.lbp=t,s[e]=r),r},l=function(e){if(a){e.remaining=c(),u.push(e);var t=s["(error)"];return(i=Object.create(t)).error=e,i.type="(error)",i}throw e.stack=(new Error).stack,e},h=function(e,r){if(e&&i.id!==e){var n={code:"(end)"===i.id?"S0203":"S0202",position:i.position,token:i.value,value:e};return l(n)}var a=o(r);if(null===a)return(i=s["(end)"]).position=t.length,i;var u,c=a.value,p=a.type;switch(p){case"name":case"variable":u=s["(name)"];break;case"operator":if(!(u=s[c]))return l({code:"S0204",stack:(new Error).stack,position:a.position,token:c});break;case"string":case"number":case"value":u=s["(literal)"];break;case"regex":p="regex",u=s["(regex)"];break;default:return l({code:"S0205",stack:(new Error).stack,position:a.position,token:c})}return(i=Object.create(u)).value=c,i.type=p,i.position=a.position,i},d=function(e){var t,r=i;for(h(null,!0),t=r.nud();e<i.lbp;)r=i,h(),t=r.led(t);return t},v=function(e){f(e,0).nud=function(){return this}},g=function(t,r,n){var a=r||e[t],i=f(t,a);return i.led=n||function(e){return this.lhs=e,this.rhs=d(a),this.type="binary",this},i},m=function(e,t,r){var n=f(e,t);return n.led=r,n},y=function(e,t){var r=f(e);return r.nud=t||function(){return this.expression=d(70),this.type="unary",this},r};v("(end)"),v("(name)"),v("(literal)"),v("(regex)"),f(":"),f(";"),f(","),f(")"),f("]"),f("}"),f(".."),g("."),g("+"),g("-"),g("*"),g("/"),g("%"),g("="),g("<"),g(">"),g("!="),g("<="),g(">="),g("&"),g("and"),g("or"),g("in"),v("and"),v("or"),v("in"),y("-"),g("~>"),m("(error)",10,function(e){return this.lhs=e,this.error=i.error,this.remaining=c(),this.type="error",this}),y("*",function(){return this.type="wildcard",this}),y("**",function(){return this.type="descendant",this}),y("%",function(){return this.type="parent",this}),g("(",e["("],function(e){if(this.procedure=e,this.type="function",this.arguments=[],")"!==i.id)for(;"operator"===i.type&&"?"===i.id?(this.type="partial",this.arguments.push(i),h("?")):this.arguments.push(d(0)),","===i.id;)h(",");if(h(")",!0),"name"===e.type&&("function"===e.value||"λ"===e.value)){if(this.arguments.forEach(function(e,t){if("variable"!==e.type)return l({code:"S0208",stack:(new Error).stack,position:e.position,token:e.value,value:t+1})}),this.type="lambda","<"===i.id){for(var t=i.position,r=1,a="<";r>0&&"{"!==i.id&&"(end)"!==i.id;){var o=h();">"===o.id?r--:"<"===o.id&&r++,a+=o.value}h(">");try{this.signature=n(a)}catch(e){return e.position=t+e.offset,l(e)}}h("{"),this.body=d(0),h("}")}return this}),y("(",function(){for(var e=[];")"!==i.id&&(e.push(d(0)),";"===i.id);)h(";");return h(")",!0),this.type="block",this.expressions=e,this}),y("[",function(){var e=[];if("]"!==i.id)for(;;){var t=d(0);if(".."===i.id){var r={type:"binary",value:"..",position:i.position,lhs:t};h(".."),r.rhs=d(0),t=r}if(e.push(t),","!==i.id)break;h(",")}return h("]",!0),this.expressions=e,this.type="unary",this}),g("[",e["["],function(t){if("]"===i.id){for(var r=t;r&&"binary"===r.type&&"["===r.value;)r=r.lhs;return r.keepArray=!0,h("]"),t}return this.lhs=t,this.rhs=d(e["]"]),this.type="binary",h("]",!0),this}),g("^",e["^"],function(e){h("(");for(var t=[];;){var r={descending:!1};if("<"===i.id?h("<"):">"===i.id&&(r.descending=!0,h(">")),r.expression=d(0),t.push(r),","!==i.id)break;h(",")}return h(")"),this.lhs=e,this.rhs=t,this.type="binary",this});var b=function(e){var t=[];if("}"!==i.id)for(;;){var r=d(0);h(":");var n=d(0);if(t.push([r,n]),","!==i.id)break;h(",")}return h("}",!0),void 0===e?(this.lhs=t,this.type="unary"):(this.lhs=e,this.rhs=t,this.type="binary"),this};y("{",b),g("{",e["{"],b),m(":=",e[":="],function(t){return"variable"!==t.type?l({code:"S0212",stack:(new Error).stack,position:t.position,token:t.value}):(this.lhs=t,this.rhs=d(e[":="]-1),this.type="binary",this)}),g("@",e["@"],function(t){return this.lhs=t,this.rhs=d(e["@"]),"variable"!==this.rhs.type?l({code:"S0214",stack:(new Error).stack,position:this.rhs.position,token:"@"}):(this.type="binary",this)}),g("#",e["#"],function(t){return this.lhs=t,this.rhs=d(e["#"]),"variable"!==this.rhs.type?l({code:"S0214",stack:(new Error).stack,position:this.rhs.position,token:"#"}):(this.type="binary",this)}),g("?",e["?"],function(e){return this.type="condition",this.condition=e,this.then=d(0),":"===i.id&&(h(":"),this.else=d(0)),this}),y("|",function(){return this.type="transform",this.pattern=d(0),h("|"),this.update=d(0),","===i.id&&(h(","),this.delete=d(0)),h("|"),this});var w=function(e){var t;if("function"!==e.type||e.predicate)if("condition"===e.type)e.then=w(e.then),void 0!==e.else&&(e.else=w(e.else)),t=e;else if("block"===e.type){var r=e.expressions.length;r>0&&(e.expressions[r-1]=w(e.expressions[r-1])),t=e}else t=e;else{var n={type:"lambda",thunk:!0,arguments:[],position:e.position};n.body=e,t=n}return t},k=0,x=0,A=[],E=function(e,t){switch(e.type){case"name":case"wildcard":t.level--,0===t.level&&(void 0===e.ancestor?e.ancestor=t:(A[t.index].slot.label=e.ancestor.label,e.ancestor=t),e.tuple=!0);break;case"parent":t.level++;break;case"block":e.expressions.length>0&&(e.tuple=!0,t=E(e.expressions[e.expressions.length-1],t));break;case"path":e.tuple=!0;var r=e.steps.length-1;for(t=E(e.steps[r--],t);t.level>0&&r>=0;)t=E(e.steps[r--],t);break;default:throw{code:"S0217",token:e.type,position:e.position}}return t},T=function(e,t){if(void 0!==t.seekingParent||"parent"===t.type){var r=void 0!==t.seekingParent?t.seekingParent:[];"parent"===t.type&&r.push(t.slot),void 0===e.seekingParent?e.seekingParent=r:Array.prototype.push.apply(e.seekingParent,r)}},D=function(e){var t=e.steps.length-1,r=e.steps[t],n=void 0!==r.seekingParent?r.seekingParent:[];"parent"===r.type&&n.push(r.slot);for(var a=0;a<n.length;a++){var i=n[a];for(t=e.steps.length-2;i.level>0;){if(t<0){void 0===e.seekingParent?e.seekingParent=[i]:e.seekingParent.push(i);break}for(var o=e.steps[t--];t>=0&&o.focus&&e.steps[t].focus;)o=e.steps[t--];i=E(o,i)}}},S=function(e){var t;switch(e.type){case"binary":switch(e.value){case".":var r=S(e.lhs);t="path"===r.type?r:{type:"path",steps:[r]},"parent"===r.type&&(t.seekingParent=[r.slot]);var n=S(e.rhs);"function"===n.type&&"path"===n.procedure.type&&1===n.procedure.steps.length&&"name"===n.procedure.steps[0].type&&"function"===t.steps[t.steps.length-1].type&&(t.steps[t.steps.length-1].nextFunction=n.procedure.steps[0].value),"path"===n.type?Array.prototype.push.apply(t.steps,n.steps):(void 0!==n.predicate&&(n.stages=n.predicate,delete n.predicate),t.steps.push(n)),t.steps.filter(function(e){if("number"===e.type||"value"===e.type)throw{code:"S0213",stack:(new Error).stack,position:e.position,value:e.value};return"string"===e.type}).forEach(function(e){e.type="name"}),t.steps.filter(function(e){return!0===e.keepArray}).length>0&&(t.keepSingletonArray=!0);var i=t.steps[0];"unary"===i.type&&"["===i.value&&(i.consarray=!0);var o=t.steps[t.steps.length-1];"unary"===o.type&&"["===o.value&&(o.consarray=!0),D(t);break;case"[":var s=t=S(e.lhs),c="predicate";if("path"===t.type&&(s=t.steps[t.steps.length-1],c="stages"),void 0!==s.group)throw{code:"S0209",stack:(new Error).stack,position:e.position};void 0===s[c]&&(s[c]=[]);var p=S(e.rhs);void 0!==p.seekingParent&&(p.seekingParent.forEach(e=>{1===e.level?E(s,e):e.level--}),T(s,p)),s[c].push({type:"filter",expr:p,position:e.position});break;case"{":if(void 0!==(t=S(e.lhs)).group)throw{code:"S0210",stack:(new Error).stack,position:e.position};t.group={lhs:e.rhs.map(function(e){return[S(e[0]),S(e[1])]}),position:e.position};break;case"^":"path"!==(t=S(e.lhs)).type&&(t={type:"path",steps:[t]});var f={type:"sort",position:e.position};f.terms=e.rhs.map(function(e){var t=S(e.expression);return T(f,t),{descending:e.descending,expression:t}}),t.steps.push(f),D(t);break;case":=":(t={type:"bind",value:e.value,position:e.position}).lhs=S(e.lhs),t.rhs=S(e.rhs),T(t,t.rhs);break;case"@":if(t=S(e.lhs),s=t,"path"===t.type&&(s=t.steps[t.steps.length-1]),void 0!==s.stages||void 0!==s.predicate)throw{code:"S0215",stack:(new Error).stack,position:e.position};if("sort"===s.type)throw{code:"S0216",stack:(new Error).stack,position:e.position};e.keepArray&&(s.keepArray=!0),s.focus=e.rhs.value,s.tuple=!0;break;case"#":t=S(e.lhs),s=t,"path"===t.type?s=t.steps[t.steps.length-1]:(t={type:"path",steps:[t]},void 0!==s.predicate&&(s.stages=s.predicate,delete s.predicate)),void 0===s.stages?s.index=e.rhs.value:s.stages.push({type:"index",value:e.rhs.value,position:e.position}),s.tuple=!0;break;case"~>":(t={type:"apply",value:e.value,position:e.position}).lhs=S(e.lhs),t.rhs=S(e.rhs);break;default:(t={type:e.type,value:e.value,position:e.position}).lhs=S(e.lhs),t.rhs=S(e.rhs),T(t,t.lhs),T(t,t.rhs)}break;case"unary":t={type:e.type,value:e.value,position:e.position},"["===e.value?t.expressions=e.expressions.map(function(e){var r=S(e);return T(t,r),r}):"{"===e.value?t.lhs=e.lhs.map(function(e){var r=S(e[0]);T(t,r);var n=S(e[1]);return T(t,n),[r,n]}):(t.expression=S(e.expression),"-"===e.value&&"number"===t.expression.type?(t=t.expression).value=-t.value:T(t,t.expression));break;case"function":case"partial":(t={type:e.type,name:e.name,value:e.value,position:e.position}).arguments=e.arguments.map(function(e){var r=S(e);return T(t,r),r}),t.procedure=S(e.procedure);break;case"lambda":t={type:e.type,arguments:e.arguments,signature:e.signature,position:e.position};var l=S(e.body);t.body=w(l);break;case"condition":(t={type:e.type,position:e.position}).condition=S(e.condition),T(t,t.condition),t.then=S(e.then),T(t,t.then),void 0!==e.else&&(t.else=S(e.else),T(t,t.else));break;case"transform":(t={type:e.type,position:e.position}).pattern=S(e.pattern),t.update=S(e.update),void 0!==e.delete&&(t.delete=S(e.delete));break;case"block":(t={type:e.type,position:e.position}).expressions=e.expressions.map(function(e){var r=S(e);return T(t,r),(r.consarray||"path"===r.type&&r.steps[0].consarray)&&(t.consarray=!0),r});break;case"name":t={type:"path",steps:[e]},e.keepArray&&(t.keepSingletonArray=!0);break;case"parent":t={type:"parent",slot:{label:"!"+k++,level:1,index:x++}},A.push(t);break;case"string":case"number":case"value":case"wildcard":case"descendant":case"variable":case"regex":t=e;break;case"operator":if("and"===e.value||"or"===e.value||"in"===e.value)e.type="name",t=S(e);else{if("?"!==e.value)throw{code:"S0201",stack:(new Error).stack,position:e.position,token:e.value};t=e}break;case"error":t=e,e.lhs&&(t=S(e.lhs));break;default:var h="S0206";"(end)"===e.id&&(h="S0207");var d={code:h,position:e.position,token:e.value};if(a)return u.push(d),{type:"error",error:d};throw d.stack=(new Error).stack,d}return e.keepArray&&(t.keepArray=!0),t};o=r(t),h();var O=d(0);if("(end)"!==i.id){var P={code:"S0201",position:i.position,token:i.value};l(P)}if("parent"===(O=S(O)).type||void 0!==O.seekingParent)throw{code:"S0217",token:O.type,position:O.position};return u.length>0&&(O.errors=u),O}})();t.exports=a},{"./signature":5}],5:[function(e,t,r){var n=e("./utils");const a=(()=>{"use strict";var e={a:"arrays",b:"booleans",f:"functions",n:"numbers",o:"objects",s:"strings"};return function(t){for(var r=1,a=[],i={},o=i;r<t.length;){var s=t.charAt(r);if(":"===s)break;var u=function(){a.push(i),o=i,i={}},c=function(e,t,r,n){for(var a=1,i=t;i<e.length;)if(i++,(s=e.charAt(i))===n){if(0==--a)break}else s===r&&a++;return i};switch(s){case"s":case"n":case"b":case"l":case"o":i.regex="["+s+"m]",i.type=s,u();break;case"a":i.regex="[asnblfom]",i.type=s,i.array=!0,u();break;case"f":i.regex="f",i.type=s,u();break;case"j":i.regex="[asnblom]",i.type=s,u();break;case"x":i.regex="[asnblfom]",i.type=s,u();break;case"-":o.context=!0,o.contextRegex=new RegExp(o.regex),o.regex+="?";break;case"?":case"+":o.regex+=s;break;case"(":var p=c(t,r,"(",")"),f=t.substring(r+1,p);if(-1!==f.indexOf("<"))throw{code:"S0402",stack:(new Error).stack,value:f,offset:r};i.regex="["+f+"m]",i.type="("+f+")",r=p,u();break;case"<":if("a"!==o.type&&"f"!==o.type)throw{code:"S0401",stack:(new Error).stack,value:o.type,offset:r};var l=c(t,r,"<",">");o.subtype=t.substring(r+1,l),r=l}r++}var h="^"+a.map(function(e){return"("+e.regex+")"}).join("")+"$",d=new RegExp(h),v=function(e){var t;if(n.isFunction(e))t="f";else switch(typeof e){case"string":t="s";break;case"number":t="n";break;case"boolean":t="b";break;case"object":t=null===e?"l":Array.isArray(e)?"a":"o";break;case"undefined":default:t="m"}return t};return{definition:t,validate:function(t,r){var n="";t.forEach(function(e){n+=v(e)});var i=d.exec(n);if(i){var o=[],s=0;return a.forEach(function(n,a){var u=t[s],c=i[a+1];if(""===c)if(n.context&&n.contextRegex){var p=v(r);if(!n.contextRegex.test(p))throw{code:"T0411",stack:(new Error).stack,value:r,index:s+1};o.push(r)}else o.push(u),s++;else c.split("").forEach(function(r){if("a"===n.type){if("m"===r)u=void 0;else{u=t[s];var a=!0;if(void 0!==n.subtype)if("a"!==r&&c!==n.subtype)a=!1;else if("a"===r&&u.length>0){var i=v(u[0]);a=i===n.subtype.charAt(0)&&0===u.filter(function(e){return v(e)!==i}).length}if(!a)throw{code:"T0412",stack:(new Error).stack,value:u,index:s+1,type:e[n.subtype]};"a"!==r&&(u=[u])}o.push(u),s++}else o.push(u),s++})}),o}!function(e,t){for(var r="^",n=0,i=0;i<a.length;i++){r+=a[i].regex;var o=t.match(r);if(null===o)throw{code:"T0410",stack:(new Error).stack,value:e[n],index:n+1};n=o[0].length}throw{code:"T0410",stack:(new Error).stack,value:e[n],index:n+1}}(t,n)}}}})();t.exports=a},{"./utils":6}],6:[function(e,t,r){const n=(()=>{"use strict";function e(e){var t=!1;if("number"==typeof e&&(t=!isNaN(e))&&!isFinite(e))throw{code:"D1001",value:e,stack:(new Error).stack};return t}var t=("function"==typeof Symbol?Symbol:{}).iterator||"@@iterator";return{isNumeric:e,isArrayOfStrings:function(e){var t=!1;return Array.isArray(e)&&(t=0===e.filter(function(e){return"string"!=typeof e}).length),t},isArrayOfNumbers:function(t){var r=!1;return Array.isArray(t)&&(r=0===t.filter(function(t){return!e(t)}).length),r},createSequence:function(){var e=[];return e.sequence=!0,1===arguments.length&&e.push(arguments[0]),e},isSequence:function(e){return!0===e.sequence&&Array.isArray(e)},isFunction:function(e){return e&&(!0===e._jsonata_function||!0===e._jsonata_lambda)||"function"==typeof e},isLambda:function(e){return e&&!0===e._jsonata_lambda},isIterable:function(e){return"object"==typeof e&&null!==e&&t in e&&"next"in e&&"function"==typeof e.next},getFunctionArity:function(e){return"number"==typeof e.arity?e.arity:"function"==typeof e.implementation?e.implementation.length:"number"==typeof e.length?e.length:e.arguments.length},isDeepEqual:function e(t,r){if(t===r)return!0;if("object"==typeof t&&"object"==typeof r&&null!==t&&null!==r){if(Array.isArray(t)&&Array.isArray(r)){if(t.length!==r.length)return!1;for(var n=0;n<t.length;n++)if(!e(t[n],r[n]))return!1;return!0}var a=Object.getOwnPropertyNames(t),i=Object.getOwnPropertyNames(r);if(a.length!==i.length)return!1;for(a=a.sort(),i=i.sort(),n=0;n<a.length;n++)if(a[n]!==i[n])return!1;for(n=0;n<a.length;n++){var o=a[n];if(!e(t[o],r[o]))return!1}return!0}return!1},stringToArray:function(e){var t=[];for(let r of e)t.push(r);return t},isPromise:function(e){return"object"==typeof e&&null!==e&&"then"in e&&"function"==typeof e.then}}})();t.exports=n},{}]},{},[3])(3)});
return jsonata;
}

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

		return Object.fromEntries(result.map((value, i) => [fieldNames[i], value]));
	}

	function getFieldsByName(
		table)
	{
		return table.fields.reduce((result, field) => {
			const { options } = field;

			if (options?.choices) {
					// extract the name strings from each choice so they're easier to access
				field.values = options.choices.map(({ name }) => name);
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
			name)
		{
			times[name] = Date.now();
		}

		function timeEnd(
			name)
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
	};
}
