const text = `
\tNon-housing basic needs
Non-housing basic needs\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site programs and services that ensure access to food. Enter 'N/A' if the services were not provided during this reporting year.
Non-housing basic needs\tPlease enter program name(s) (e.g. world kitchen, senior meals on wheels, CalFresh application)
Non-housing basic needs\tPlease enter # of total served during this reporting period.
Non-housing basic needs\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site programs and services that address utility financial assistance. Enter 'N/A' if the services were not provided during this reporting year.
Non-housing basic needs\tPlease enter program name(s) for utility financial assistance (e.g Monthly stipend, CARE, FERA):
Non-housing basic needs\tPlease enter # of total served during this reporting period.
Non-housing basic needs\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site programs and services that address transportation needs. Enter 'N/A' if the services were not provided during this reporting year.
Non-housing basic needs\tPlease enter program name(s) for transportation support (e.g GoGoGradparent, Clipper Card Assistance, Muni Tokens for Residents, On-site shuttle/Paratransit):
Non-housing basic needs\tPlease enter # of total served during this reporting period.
Non-housing basic needs\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of other on-site programs and services that address Non-housing basic needs. Enter 'N/A' if services were not provided during this reporting year.
Non-housing basic needs\tPlease enter program name(s) for that address non-housing basic needs (e.g Housekeeping, Annual Dump Day):
Non-housing basic needs\tPlease enter # of total served during this reporting period.
\t
\tCommunity Building
Community Building\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of social events and gatherings that promote community-building. Enter 'N/A' if services were not provided during this reporting year.
Community Building\tPlease enter name(s) of social events and gatherings (e.g. Kwanzaa dinner, Knitting Korner, Puzzles and pizza):
Community Building\tPlease enter # of total served during this reporting period.
Community Building\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) on-site group exercise classes. Enter 'N/A' if services were not provided during this reporting year.
Community Building\tPlease enter name(s) of group exercise classes (e.g. Chair yoga, Walking group, Zumba):
Community Building\tPlease enter # of total served during this reporting period.
Community Building\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site enrichment classes. Enter 'N/A' if services were not provided during this reporting year.
Community Building\tPlease enter name(s) of enrichment classes (e.g. Learn to garden, Walking history tour of SOMA):
Community Building\tPlease enter # of total served during this reporting period.
Community Building\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site community-building programming. Enter 'N/A' if services were not provided during this reporting year.
Community Building\tPlease enter name(s) of any other community-building programs:
Community Building\tPlease enter # of total served during this reporting period.
\t
\tTraining and Education
\t
Training and Education\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site educational services. Enter 'N/A' if services were not provided during this reporting year.
Training and Education\tPlease enter name(s) of on-site education services (e.g. GED classes, ESL classes):
Training and Education\tPlease enter # of total served during this reporting period.
Training and Education\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site life-skills training. Enter 'N/A' if services were not provided during this reporting year.
Training and Education\tPlease enter name(s) of on-site life-skills training (e.g. Learn the Web):
Training and Education\tPlease enter # of total served during this reporting period.
Training and Education\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site employment assistance and job trainings . Enter 'N/A' if services were not provided during this reporting year.
Training and Education\tPlease enter name(s) of on-site employment assistance and job trainings (e.g. Job placement and support, Resume assistance ):
Training and Education\tPlease enter # of total served during this reporting period.
\t
\tService coordination and linkages
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site individual case management . Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter # of total served during this reporting period.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site mental health services . Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site mental health services. Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter # of total served during this reporting period.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site outpatient services . Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site outpatient services. Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter # of total served during this reporting period.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site substance abuse services . Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of on-site substance abuse services. Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter # of total served during this reporting period.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of other on-site service coordination and linkages. Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter frequency (e.g. daily, monthly, quarterly, as needed) of other on-site service coordination and linkages. Enter 'N/A' if services were not provided during this reporting year.
Service coordination and linkages\tPlease enter # of total served during this reporting period.
Service coordination and linkages\tPlease share other on-site services, not mentioned above. Enter 'N/A' if services were not provided during this reporting year.
`;
const rows = text.split("\n")
	.filter(row => row.split("\t")[0] && row.includes("e.g"))
	.map(row => row.replace(/ Enter 'N\/A' if (?:the )?services were not provided during this reporting year\./, "").trim())
	.map(row => {
		let [section, text] = row.split("\t");

		text = text.replace(/\s*[.:)]+\s*$/, "");

		if (text.includes("name")) {
			text = text.replace("Please enter name(s) of ", "")
				.replace(/Please enter program name\(s\) (?:for )?(?:that )?/, "")
				.split(/\s*\(e\.g\.?\s*/)
		} else {
			text = [text.replace("Please enter frequency (e.g. daily, monthly, quarterly, as needed) of ", "")]
		}

//		text = text.replace(/\s*[.:]\s*$/, "")
//			.split(/\s*\(e\.g\.?\s*/)

		return [section, ...text].join("\t");
	})

console.log(rows.join("\n"));
