var tootConfig, authCallback;

var TOOTAPI = '/api/v1/';

function mastodonFetch(request) {

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    }

    return fetch(request)
        .then(checkStatus);
}

function mastodonRequest(method, endpoint, params) {
    var data = false;
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var url = protocol + '://' + tootConfig.domain + TOOTAPI + endpoint;

    var headers = new Headers();
    headers.set('Authorization', 'Bearer ' + tootConfig.access_token);

    var rq = {
        mode: 'cors',
        method: method,
        headers: headers,
    };

    if (params) {
        data = new FormData();
        for (var p in params) {
            data.append(p, params[p]);
        }
        rq.body = data;
    }

    var request = new Request(url, rq);

    return mastodonFetch(request)
        .then(function(responseObj) {
            return responseObj.json();
        });
}

function mastodonAppCreate() {
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var url = protocol + '://' + tootConfig.domain + TOOTAPI + 'apps';
    var redirect_url = chrome.identity.getRedirectURL();

    var data = new FormData();
    var params = {
        'client_name': 'Tooter',
        'website': 'https://github.com/ineffyble/tooter',
        'redirect_uris': redirect_url,
        'scopes': 'read write'
    };
    for (var p in params) {
        data.append(p, params[p]);
    }

    var request = new Request(url, {
        mode: 'cors',
        method: 'POST',
        body: data
    });

    return mastodonFetch(request)
        .then(function(responseObj) {
            return responseObj.json();
        });
}

function mastodonLogIn(client_id) {
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var redirect_url = chrome.identity.getRedirectURL();

    var url = `${protocol}://${tootConfig.domain}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_url}&response_type=code&scope=read+write`;

    chrome.identity.launchWebAuthFlow({
        'url': url,
        'interactive': true
    }, authCallback);
}

function mastodonGetAccessToken(code) {
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var url = protocol + '://' + tootConfig.domain + '/oauth/token';
    var redirect_url = chrome.identity.getRedirectURL();

    var data = new FormData();
    var params = {
        'client_id': tootConfig.client_id,
        'client_secret': tootConfig.client_secret,
        'code': code,
        'grant_type': 'authorization_code',
        'scope': 'read write',
        'redirect_uri': redirect_url
    };
    for (var p in params) {
        data.append(p, params[p]);
    }

    var request = new Request(url, {
        mode: 'cors',
        method: 'POST',
        body: data
    });

    return mastodonFetch(request)
        .then(function(responseObj) {
            return responseObj.json();
        })
        .catch(function(error) {
            return error;
        });
}


function mastodonValidateCredentials() {
    return mastodonRequest('GET', 'accounts/verify_credentials', false)
        .then(function(re) {
            return re;
        });
}

function mastodonPost(text) {
    return mastodonRequest('POST', 'statuses', {'status': text})
        .then(function(re) {
            return re;
        });
}
