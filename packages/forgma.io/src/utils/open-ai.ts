import { FormioJSON } from "@/types";

//const GenerateKeysURL = "http://127.0.0.1:3000/api/generateKeys";
const GenerateKeysURL = "https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ebdb2c50-b3cd-475a-a51d-2cf90d5b6185/openai/generateKeys";

export async function generateKeys(
	panels: FormioJSON[]): Promise<FormioJSON[]>
{
	const body = JSON.stringify({ panels });
	const response = await fetch(GenerateKeysURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body
	});

	return (await response.json()).result;
}
