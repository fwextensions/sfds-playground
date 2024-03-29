type Component = {
	key?: string;
	label?: string;
	legend?: string;
	components?: Component[];
};

const json = {
  "type": "well",
  "label": "Mailing address well (this label will not be shown)",
  "key": "mailingAddressWell",
  "tableView": false,
  "properties": {
    "visible": "true",
    "sfdsComponentId": "mailingAddressWell",
    "sfdsThemeVersion": "7.0.0"
  },
  "components": [
    {
      "legend": "Address",
      "key": "mailingAddressFieldset",
      "properties": {
        "sfdsComponentId": "mailingAddressFieldset",
        "sfdsThemeVersion": "7.0.0"
      },
      "type": "fieldset",
      "label": "Mailing address",
      "tableView": false,
      "components": [
        {
          "label": "Address line 1",
          "key": "line1",
          "type": "textfield",
          "input": true,
          "properties": {
            "sfdsComponentId": "addressLine1",
            "sfdsThemeVersion": "7.0.0",
            "es:label": "Dirección linea 1"
          },
          "validate": {
            "required": true
          },
          "tableView": true
        },
        {
          "label": "Address line 2",
          "key": "line2",
          "type": "textfield",
          "input": true,
          "properties": {
            "sfdsComponentId": "addressLine2",
            "sfdsThemeVersion": "7.0.0",
            "es:label": "Dirección linea 2"
          },
          "tableView": true
        },
        {
          "label": "City",
          "type": "textfield",
          "key": "city",
          "input": true,
          "validate": {
            "required": true
          },
          "properties": {
            "sfdsComponentId": "city",
            "sfdsThemeVersion": "7.0.0",
            "es:label": "Ciudad"
          },
          "tableView": true
        },
        {
          "type": "columns",
          "key": "addressStateAndZIP",
          "tableView": false,
          "properties": {
            "sfdsComponentId": "addressStateAndZIP",
            "sfdsThemeVersion": "7.0.0"
          },
          "columns": [
            {
              "width": 6,
              "components": [
                {
                  "label": "State",
                  "widget": "html5",
                  "customClass": "mb-2 mb-md-0",
                  "tableView": true,
                  "data": {
                    "values": [
                      {
                        "label": "Alabama",
                        "value": "AL"
                      },
                      {
                        "label": "Alaska",
                        "value": "AK"
                      },
                      {
                        "label": "American Samoa",
                        "value": "AS"
                      },
                      {
                        "label": "Arizona",
                        "value": "AZ"
                      },
                      {
                        "label": "Arkansas",
                        "value": "AR"
                      },
                      {
                        "label": "California",
                        "value": "CA"
                      },
                      {
                        "label": "Colorado",
                        "value": "CO"
                      },
                      {
                        "label": "Connecticut",
                        "value": "CT"
                      },
                      {
                        "label": "Delaware",
                        "value": "DE"
                      },
                      {
                        "label": "District of Columbia",
                        "value": "DC"
                      },
                      {
                        "label": "Florida",
                        "value": "FL"
                      },
                      {
                        "label": "Georgia",
                        "value": "GA"
                      },
                      {
                        "label": "Guam",
                        "value": "GU"
                      },
                      {
                        "label": "Hawaii",
                        "value": "HI"
                      },
                      {
                        "label": "Idaho",
                        "value": "ID"
                      },
                      {
                        "label": "Illinois",
                        "value": "IL"
                      },
                      {
                        "label": "Indiana",
                        "value": "IN"
                      },
                      {
                        "label": "Iowa",
                        "value": "IA"
                      },
                      {
                        "label": "Kansas",
                        "value": "KS"
                      },
                      {
                        "label": "Kentucky",
                        "value": "KY"
                      },
                      {
                        "label": "Louisiana",
                        "value": "LA"
                      },
                      {
                        "label": "Maine",
                        "value": "ME"
                      },
                      {
                        "label": "Maryland",
                        "value": "MD"
                      },
                      {
                        "label": "Massachusetts",
                        "value": "MA"
                      },
                      {
                        "label": "Michigan",
                        "value": "MI"
                      },
                      {
                        "label": "Minnesota",
                        "value": "MN"
                      },
                      {
                        "label": "Mississippi",
                        "value": "MS"
                      },
                      {
                        "label": "Missouri",
                        "value": "MO"
                      },
                      {
                        "label": "Montana",
                        "value": "MT"
                      },
                      {
                        "label": "Nebraska",
                        "value": "NE"
                      },
                      {
                        "label": "Nevada",
                        "value": "NV"
                      },
                      {
                        "label": "New Hampshire",
                        "value": "NH"
                      },
                      {
                        "label": "New Jersey",
                        "value": "NJ"
                      },
                      {
                        "label": "New Mexico",
                        "value": "NM"
                      },
                      {
                        "label": "New York",
                        "value": "NY"
                      },
                      {
                        "label": "North Carolina",
                        "value": "NC"
                      },
                      {
                        "label": "North Dakota",
                        "value": "ND"
                      },
                      {
                        "label": "Northern Mariana Islands",
                        "value": "MP"
                      },
                      {
                        "label": "Ohio",
                        "value": "OH"
                      },
                      {
                        "label": "Oklahoma",
                        "value": "OK"
                      },
                      {
                        "label": "Oregon",
                        "value": "OR"
                      },
                      {
                        "label": "Pennsylvania",
                        "value": "PA"
                      },
                      {
                        "label": "Puerto Rico",
                        "value": "PR"
                      },
                      {
                        "label": "Rhode Island",
                        "value": "RI"
                      },
                      {
                        "label": "South Carolina",
                        "value": "SC"
                      },
                      {
                        "label": "South Dakota",
                        "value": "SD"
                      },
                      {
                        "label": "Tennessee",
                        "value": "TN"
                      },
                      {
                        "label": "Texas",
                        "value": "TX"
                      },
                      {
                        "label": "Utah",
                        "value": "UT"
                      },
                      {
                        "label": "Vermont",
                        "value": "VT"
                      },
                      {
                        "label": "Virgin Islands",
                        "value": "VI"
                      },
                      {
                        "label": "Virginia",
                        "value": "VA"
                      },
                      {
                        "label": "Washington",
                        "value": "WA"
                      },
                      {
                        "label": "West Virginia",
                        "value": "WV"
                      },
                      {
                        "label": "Wisconsin",
                        "value": "WI"
                      },
                      {
                        "label": "Wyoming",
                        "value": "WY"
                      }
                    ]
                  },
                  "template": "{{ item.label }}",
                  "validate": {
                    "required": true
                  },
                  "key": "state",
                  "tags": [
                    "shared"
                  ],
                  "properties": {
                    "sfdsComponentId": "state",
                    "sfdsThemeVersion": "7.0.0",
                    "es:label": "Estado"
                  },
                  "type": "select",
                  "lazyLoad": false,
                  "input": true,
                  "hideOnChildrenHidden": false
                }
              ],
              "offset": 0,
              "push": 0,
              "pull": 0,
              "size": "md",
              "currentWidth": 6
            },
            {
              "width": 6,
              "components": [
                {
                  "label": "ZIP code",
                  "type": "textfield",
                  "key": "zip",
                  "input": true,
                  "validate": {
                    "maxLength": 10,
                    "pattern": "([0-9]{5}(-[0-9]{4})?)?",
                    "required": true
                  },
                  "errors": {
                    "pattern": "Please enter a 5-digit <a href=\"https://en.wikipedia.org/wiki/ZIP_Code\">ZIP code</a>"
                  },
                  "properties": {
                    "sfdsComponentId": "zipCode",
                    "sfdsThemeVersion": "7.0.0"
                  },
                  "hideOnChildrenHidden": false,
                  "tableView": true
                }
              ],
              "offset": 0,
              "push": 0,
              "pull": 0,
              "size": "md",
              "currentWidth": 6
            }
          ],
          "input": false,
          "label": "Columns"
        }
      ],
      "input": false
    }
  ],
  "input": false
};

function makeKeysUnique(
	component: Component,
	uniqueKey: (s: string) => string)
{
	if (component.key) {
		component.key = uniqueKey(component.key);
	}

	if (component.components) {
		for (const child of component.components) {
			makeKeysUnique(child, uniqueKey);
		}
	}

	return component;
}

export default function mailingAddress(
	id: string,
	label: string,
	uniqueKey: (s: string) => string)
{
	const component = JSON.parse(JSON.stringify(json));

	component.key = id;
	component.components[0].legend = label;

	return makeKeysUnique(component, uniqueKey);
}
