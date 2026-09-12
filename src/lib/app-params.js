// Reads the access token from localStorage — previously delegated to
// getAccessToken() from @base44/sdk, which read the same key.
const TOKEN_KEY = 'base44_access_token';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem(TOKEN_KEY);
	window.localStorage.removeItem('token');
}

const getAccessToken = () => {
	if (isNode) return null;
	return window.localStorage.getItem(TOKEN_KEY) || window.localStorage.getItem('token') || null;
};

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		// appId and appBaseUrl were Base44-specific; kept as null so OAuthConsent
		// renders its error state rather than throwing on undefined access.
		appId: null,
		token: getAccessToken(),
		functionsVersion: null,
		appBaseUrl: null,
	}
}

export const appParams = {
	...getAppParams()
}
