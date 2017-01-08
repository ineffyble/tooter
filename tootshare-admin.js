var tootConfig;

function validCredentials() {
    return mastodonRequest('GET', 'accounts/verify_credentials', false)
        .then(function(re) {
            return re;
        });
}

function loggedIn(username, domain) {
    var html = '';
    html += '<p>';
    html += 'You are logged in as ' + username + ' on ' + domain;
    html += '</p>';
    html += '<button id="logoutbutton">Log out</button>';
    document.getElementById('status').innerHTML = html;
    document.getElementById('logoutbutton').addEventListener('click', logOut);
    document.getElementById('login').style.display = 'none';
}

function notLoggedIn() {
    var html = '';
    html += '<p>';
    html += 'You are not logged in';
    html += '</p>';
    document.getElementById('status').innerHTML = html;
    document.getElementById('login').style.display = 'block';
    document.getElementById('loginform').addEventListener('submit', logIn);
}

function errorStatus(text) {
    var html = '';
    html += '<p>';
    html += text;
    html += '</p>';
    document.getElementById('status').innerHTML = html; 
}

function logOut() {
    delete tootConfig   .access_token;
    chrome.storage.local.set({"settings": tootConfig});
    notLoggedIn();
    fillForm();
}

function fillForm(s) {
    for (var setting in s) {
        if (document.loginform[setting]) {
            document.loginform[setting] = s[setting];
        }
    }
}

function logIn(event) {
    event.preventDefault();

    var f = this;

    tootConfig.domain = f.domain.value;
    tootConfig.secure = f.secure.value;

    var host = (f.secure.value ? 'https' : 'http') + '://' + f.domain.value + '/*';

    chrome.permissions.contains({ origins: [host] }, function(result) {
        if (result) {
            getCredentials(f);
        } else {
            chrome.permissions.request({
                origins: [host]
            }, function(granted) {
                if (granted) {
                    getCredentials(f);
                } else {
                    errorStatus(
                        'TootShare was denied permissions required to talk to Mastodon.'
                        );
                }
            });
        }
    });
}

function getCredentials(f) {
    mastodonAppCreate()
    .then(function(response) {
        if (response) {
            mastodonLogIn(response.client_id, response.client_secret, f.email.value, f.password.value).then(function(response) {
                if (response.access_token) {
                    tootConfig.access_token = response.access_token;
                    chrome.storage.local.set({"settings": tootConfig});
                    validCredentials().then(function(u) {
                        if (u.username) {
                            loggedIn(u.username, tootConfig.domain);
                        } else {
                            errorStatus(
                                'An unexpected error occurred: access token created,\
                                but unable to verify credentials.'
                                );
                        }
                    });
                } else {
                    errorStatus(
                        'Unable to verify email or password.'
                        );
                }
            });
        } else {
            errorStatus(
                'Unable to create a Mastodon app - check your domain settings.'
                );
        }
    });
}

chrome.storage.local.get("settings", function(res) {
    tootConfig = res.settings;
    if (tootConfig && tootConfig.access_token) {
        validCredentials()
            .then(function(u) {
                if (u.username) {
                    loggedIn(u.username, tootConfig.domain);
                } else {
                    notLoggedIn();
                    fillForm();
                }
            });
    } else {
        tootConfig = {};
        notLoggedIn();
    }
});