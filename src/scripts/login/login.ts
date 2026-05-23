const clientId = '79aab9b8746344ebb0edb4367327f0fb';
const redirectUri = 'http://127.0.0.1:4321/';

const scope = 'user-read-private user-read-email playlist-read-private';
const authUrl = new URL("https://accounts.spotify.com/authorize");

// If code is in URL, this is the redirect
checkForCode();

async function checkForCode() {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let err = urlParams.get('error');

    if (err) {
        console.log("Unable to login");
        console.error(err);
    } else {
        console.log(code);
    }

    if (code) {
        console.log("Getting token");
        await getToken(code);
    } else {
        console.log("Not getting token");
    }
}


async function getToken(code: string) {
    // stored in the previous step
    const codeVerifier = localStorage.getItem('code_verifier');

    if (!codeVerifier) {
        return;
    } else {
        console.log("Code Verifier");
        console.log(codeVerifier)
    }

    const url = "https://accounts.spotify.com/api/token";
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(url, payload);
    console.log(body);
    if (body.status != 200) {
        console.error(body)
    } else {
        const response = await body.json();
        console.log(response);

        localStorage.setItem('access_token', response.access_token);
        window.location.href="/dashboard";
    }

}

// First time login
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", login);
}

async function login() {
    console.log("Hello Login");
    localStorage.clear();

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

function base64encode(input: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
