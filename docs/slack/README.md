# Slack Emoji Data Analyzer

This is a static, client-side HTML page (`index.html`) for exploring and visualizing custom Slack emoji usage within a workspace.

## Features

- **Data Loading**: Automatically loads emoji data from `slackmoji.json` if available, or allows drag-and-drop / file picker upload of any Slack emoji JSON file.
- **Key Statistics**:
  - Total number of custom emoji
  - Number of unique contributors
  - Count of GIFs (based on `.gif` URLs)
  - Average uploads per month
- **Interactive Charts**:
  - **Upload Activity Over Time**: Line chart of monthly emoji uploads
  - **Top Contributors**: Horizontal bar chart (click on a bar to view that user’s emojis)
  - **Busiest Upload Days**: Top calendar days by upload count
- **Recent Activity**: List of the most recent emoji additions
- **Advanced AI Categorization**: Use Google AI Studio (Gemini) to group emoji names into semantic categories
  - Two-step flow to enter API key and trigger analysis
  - Copy resulting JSON categories to clipboard
- **Emoji Matrix Display**:
  - Shows emoji images in a grid
  - Tooltips display name, uploader, and upload date
  - Click on any emoji to copy its Slack-formatted name (`:emoji_name:`)
- **Responsive UI & UX**: Modern styling, hover effects, smooth scrolling, and visual feedback

## Usage

1. Open `index.html` in a modern web browser.
2. If `slackmoji.json` exists in the same directory, data will load automatically and the upload area will move to the bottom.
3. Otherwise, drag-and-drop or click to select a JSON file containing custom Slack emoji data.
4. View statistics and interact with charts and recent activity.
5. For AI categorization:
   - Click **Analyze with Gemini 2.5 Flash**, enter your Google AI Studio API key, then start analysis.
   - Once completed, view categorized emoji matrix and use **Copy Categories as JSON**.

## Requirements

- Internet access for Chart.js CDN and Google AI Studio API calls
- A valid Google AI Studio API key for advanced categorization

Enjoy exploring your team’s Slack emoji usage and culture insights!

## Scraping Emoji Data

The easiest way to get the emoji data for a workspace is to scrape it from the Slack custom emoji page.  First log into the Slack admin UI and go to the custom emoji page.

Then open dev tools and run the code from [`scraper.js`](scraper.js) in the console.  This will output a JSON blob of all the custom emoji to the console, which you can then copy and save to a `slackmoji.json` file.  This file can be dropped onto the analyzer page to load the emoji data.

## Code Creation

The original prompt to Claude Sonnet 4 for this code was:

> the slack admin UI has a way of seeing all the custom emoji that have been added to your workspace, along with the date they were added and who by.  is there a public api for getting this information?  the only one I could find returns just the emoji shortcut and the image.  the first screenshot shows this UI.
>
> if there's not a public api, can you write a simple console script to download the data via the webpage itself?  the api requests the page makes look like this:
>
> slack.com/api/emoji.adminList?_x_id=52e12b54-1752272893.242&slack_route=T1A099KM3&_x_version_ts=noversion&fp=6d&_x_num_retries=0
>
> slack.com/api/emoji.adminList?_x_id=52e12b54-1752279071.459&slack_route=T1A099KM3&_x_version_ts=noversion&fp=6d&_x_num_retries=0
>
> the query and post params are in the second screenshot.  looks like the token that needs to be sent is in the page itself.
>
> third screenshot shows the json response.  and the fourth shows the structure of the emoji data.
>
> the goal is to loop through all the pages and output a json array of the emoji data

It output a single page HTML file that examined the JSON and then generated the analysis.  Claude picked the highlight cards at the top, the charts, etc. and the overall styling, most of which hasn't been touched.

I asked for a more robust categorization using an LLM, but Claude ran out of tokens.  So I asked Gemini 2.5 Pro to do it:

> take a look at this single page app.  can you extend it to do a more sophisticated llm analysis of the emoji subjects using gemini 2.5 flash?  the emoji subjects could be extracted from the json, and then sent with a prompt to the llm, which would be asked to combine the subjects into sensible groups based on the meaning that can be inferred from the subject.  then those groupings would be returend, and the page could show each group along with a matrix of the custom emoji images for each group

I had to remind it that Gemini 2.5 Flash existed (it defaulted to using 1.5), but that basically worked.  This was the original prompt it created to send to Flash:

> You are an expert in analyzing team culture from Slack emoji. I will provide you with a JSON list of custom emoji names from a workspace.
Your task is to analyze the names and group them into sensible, high-level categories based on their likely meaning or usage (e.g., "Reactions", "Team Culture & Memes", "Logos", "Technical").
>
> RULES:
> 1. Return your response ONLY as a single, valid JSON object. Do not include any text before or after the JSON object.
> 2. The keys of the JSON object should be the category names you create.
> 3. The value for each key should be an array of the emoji names that belong to that category.
> 4. Categorize as many emoji as possible. Create a "Miscellaneous" or "Uncategorized" group for any that don't fit well elsewhere.
>
> Here is the list of emoji names:

That worked alright, but produced some very large categories, along with a big Miscellaneous one.  So I tried to create more emphatic rules:

> 4. You MUST keep the number of emoji per category around 50 - 75. Break down larger groups into more specific categories.
> 5. Categorize as many emoji as possible. Create a "Miscellaneous" group for any that don't fit well elsewhere.
> 6. IMPORTANT: If the "Miscellaneous" group contains more than 10% of the total emoji count, keep working to break it down further.

That caused Flash to time out after 4 minutes, returning only partial results.  So I asked Gemini 2.5 Pro to improve the prompt:

> #-- TASK DESCRIPTION --#
> You are a server-side AI tasked with a single function: categorizing a list of Slack emoji names into a structured JSON object. Your primary directives are speed of execution and strict adherence to output format.
>
> #-- PRIMARY OBJECTIVE --#
> Analyze the provided list of emoji names and group them into multiple, small, and semantically specific categories.
>
> #-- CRITICAL RULES & CONSTRAINTS --#
> 1.  **JSON-ONLY OUTPUT:** The entire response MUST be a single, valid JSON object. No extra text, commentary, or markdown is permitted.
> 2.  **MAXIMUM CATEGORY SIZE:** A category's value (the array of emoji names) MUST NOT exceed 75 items.
> 3.  **MANDATORY SPLITTING:** If a potential category exceeds the 75-item limit, it MUST be split into more granular sub-categories.
>     -   Example: If 'memes' is >75, split it into 'classic-internet-memes', 'animal-memes', 'reaction-memes'.
>     -   Example: If 'logos' is >75, split it into 'tech-company-logos', 'partner-logos'.
> 4.  **EFFECTIVE CATEGORIZATION:** Create descriptive category names based on common themes like: "celebrations", "agreement", "technical-terms", "team-mascots", "food-and-drink".
> 5.  **'MISCELLANEOUS' HANDLING:** The "Miscellaneous" category is a final fallback. It MUST contain less than 10% of the total items and NEVER more than 50 items, whichever is smaller.
>
> #-- EXECUTION STRATEGY --#
> To ensure speed and accuracy, follow this process:
> 1.  **Single Pass Scan:** Read through the entire list once to identify broad themes.
> 2.  **Estimate Group Sizes:** As you identify themes, mentally estimate their size.
> 3.  **Pre-emptive Splitting:** If you anticipate a theme will be too large, decide on its sub-categories *before* you start assigning emoji. This avoids re-processing.
> 4.  **Assign and Finalize:** Populate the JSON object with the emoji assigned to your final, granular categories.
>
> #-- INPUT DATA --#
> Here is the JSON array of emoji names to process:

That worked a lot better, though it still took over 3 minutes to process 846 emoji, and it didn't return 30 of them.
