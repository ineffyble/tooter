var tootConfig, mastodonRequest, mastodonGetAccessToken;

function validCredentials() {
    return mastodonRequest('GET', 'accounts/verify_credentials', false)
        .then(function(re) {
            return re;
        });
}

function errorStatus(text) {
    document.getElementById('status').innerText = text;
}

function loggedIn(username, domain) {
    document.getElementById('status').innerText = `Successfully logged in as ${username}@${domain}`;
    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id, function() { });
    });
}

function getCode() {
    if (window.location.search) {
        var query_string = window.location.search;
        var code = query_string.match(/code=([^&]*)/);
        if (code[1]) {
            return code[1];
        } else {
            document.getElementById('status').innerText = 'Error: callback was called without an authoriation code.';
            return false;
        }
    } else {
        document.getElementById('status').innerText = 'Error: callback was called without parameters.';
        return false;
    }
}

chrome.storage.local.get('settings', function(res) {
    tootConfig = res.settings;
    if (tootConfig) {
        var code = getCode();
        if (code) {
            mastodonGetAccessToken(code)
            .then(function(response) {
                if (response.access_token) {
                    tootConfig.access_token = response.access_token;
                    chrome.storage.local.set({'settings': tootConfig});
                    validCredentials()
                    .then(function(u) {
                        if (u.username) {
                            loggedIn(u.username, tootConfig.domain);
                        } else {
                            errorStatus(
                              'An unexpected error occurred: access token created, but unable to verify credentials.'
                            );
                        }
                    })
                    .catch(function(error) {
                        errorStatus(
                          'An unexpected error occurred: access token created, but unable to verify credentials: ' + error
                        );
                    });
                }
            })
          .catch(function(error) {
              errorStatus(
                'Unable to verify email or password: ' + error
            );
          });
        }
    } else {
        errorStatus(
          'Login callback was called, but Tooter has not been set up.'
        );
    }
});
