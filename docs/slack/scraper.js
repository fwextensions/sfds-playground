// Slack Custom Emoji Scraper
// This script extracts the token from the page and fetches all custom emoji with metadata

async function scrapeSlackEmoji(workspaceSubdomain = null) {
    console.log('Starting Slack emoji scraper...');

    // Extract token from the page
    const token = extractTokenFromPage();
    if (!token) {
        console.error('Could not find token on page. Make sure you are on a Slack workspace page.');
        return;
    }

    console.log('Token found, starting to fetch emoji data...');

    // Extract workspace ID from URL or other page elements
    const workspaceId = extractWorkspaceId();
    if (!workspaceId) {
        console.error('Could not determine workspace ID.');
        return;
    }

    // Determine the workspace subdomain
    const subdomain = workspaceSubdomain || location.hostname.split('.')[0];
    console.log(`Workspace subdomain: ${subdomain}`);
    console.log(`Workspace ID: ${workspaceId}`);

    const allEmoji = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        console.log(`Fetching page ${page}...`);

        try {
            const response = await fetchEmojiPage(token, workspaceId, page, subdomain);

            if (response.ok && response.emoji && response.emoji.length > 0) {
                allEmoji.push(...response.emoji);
                console.log(`Found ${response.emoji.length} emoji on page ${page}`);

                // Check if there are more pages
                hasMore = response.paging && response.paging.page < response.paging.pages;
                page++;
            } else {
                hasMore = false;
                console.log('No more emoji found or error occurred');
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            hasMore = false;
        }
    }

    console.log(`\nTotal emoji found: ${allEmoji.length}`);
    console.log('\nEmoji data (JSON):');
    console.log(JSON.stringify(allEmoji, null, 2));

    // Also create a downloadable file
    downloadAsFile(allEmoji, 'slack-custom-emoji.json');

    return allEmoji;
}

function extractTokenFromPage() {
    // Look for token in various places on the page

    // Method 1: Look for xoxc token in script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        const content = script.textContent || script.innerText;
        const tokenMatch = content.match(/xoxc-[0-9]+-[0-9]+-[0-9]+-[a-f0-9]+/);
        if (tokenMatch) {
            return tokenMatch[0];
        }
    }

    // Method 2: Look for api_token in window object
    if (window.TS && window.TS.boot_data && window.TS.boot_data.api_token) {
        return window.TS.boot_data.api_token;
    }

    // Method 3: Look for token in meta tags
    const tokenMeta = document.querySelector('meta[name="api-token"]');
    if (tokenMeta) {
        return tokenMeta.getAttribute('content');
    }

    // Method 4: Look in local storage
    const storedToken = localStorage.getItem('apiToken') || localStorage.getItem('slack_api_token');
    if (storedToken) {
        return storedToken;
    }

    return null;
}

function extractWorkspaceId() {
    // Method 1: From URL
    const urlMatch = window.location.href.match(/\/workspace\/([^\/]+)/);
    if (urlMatch) {
        return urlMatch[1];
    }

    // Method 2: From team_id in boot data
    if (window.TS && window.TS.boot_data && window.TS.boot_data.team_id) {
        return window.TS.boot_data.team_id;
    }

    // Method 3: From current URL subdomain
    const subdomain = window.location.hostname.split('.')[0];
    if (subdomain !== 'app' && subdomain !== 'slack') {
        return subdomain;
    }

    // Method 4: Look for team ID in page elements
    const teamIdElement = document.querySelector('[data-team-id]');
    if (teamIdElement) {
        return teamIdElement.getAttribute('data-team-id');
    }

    return null;
}

async function fetchEmojiPage(token, workspaceId, page, subdomain) {
    // Generate a unique request ID (similar to _x_id parameter)
    const requestId = generateRequestId();

    // Build URL with the workspace subdomain and query parameters
    const url = new URL(`https://${subdomain}.slack.com/api/emoji.adminList`);
    url.searchParams.set('_x_id', requestId);
    url.searchParams.set('slack_route', workspaceId);
    url.searchParams.set('_x_version_ts', 'noversion');
    url.searchParams.set('fp', '6d');
    url.searchParams.set('_x_num_retries', '0');

    // Form data for POST body
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page', page.toString());
    formData.append('count', '100');
    formData.append('sort_by', 'created');
    formData.append('sort_dir', 'desc');
    formData.append('_x_mode', 'online');
    formData.append('_x_reason', 'customize-emoji-next-page');

    const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Slack-Version-Ts': 'noversion'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

function generateRequestId() {
    // Generate a request ID similar to the format seen in the screenshots
    // Format appears to be: 8chars-timestamp.3digits
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const timestamp = Date.now();
    const extra = Math.floor(Math.random() * 1000);
    return `${id}-${timestamp}.${extra}`;
}

function downloadAsFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper function to format the data nicely
function formatEmojiData(emojiArray) {
    return emojiArray.map(emoji => ({
        name: emoji.name,
        url: emoji.url,
        created: new Date(emoji.created * 1000).toISOString(),
        created_timestamp: emoji.created,
        user_id: emoji.user_id,
        user_display_name: emoji.user_display_name,
        is_alias: emoji.is_alias,
        alias_for: emoji.alias_for || null,
        can_delete: emoji.can_delete,
        team_id: emoji.team_id,
        avatar_hash: emoji.avatar_hash
    }));
}

// Run the scraper
console.log('To run the scraper, execute one of:');
console.log('  scrapeSlackEmoji()                    // Auto-detect subdomain from current page');
console.log('  scrapeSlackEmoji("mycompany")         // Specify subdomain manually');
console.log('Make sure you are logged into Slack in this browser tab.');

// Uncomment the line below to run automatically
scrapeSlackEmoji();
