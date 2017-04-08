const TOOTAPI = '/api/v1/';

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

    console.log(request);

    return mastodonFetch(request)
        .then(function(responseObj) {
            return responseObj.json();
        });
}

function mastodonAppCreate() {
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var url = protocol + '://' + tootConfig.domain + TOOTAPI + 'apps';
    var extension_id = chrome.runtime.id;

    var data = new FormData();
    var params = {
        'client_name': 'Tooter',
        'website': 'https://github.com/ineffyble/tooter',
        'redirect_uris': 'chrome-extension://' + extension_id + '/tooter-callback.html',
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
    var extension_id = chrome.runtime.id;
    var callback_url = encodeURI(`chrome-extension://${extension_id}/tooter-callback.html`);
    var url = `${protocol}://${tootConfig.domain}/oauth/authorize?client_id=${client_id}&redirect_uri=${callback_url}&response_type=code&scope=read+write`;

    window.location.href = url;
}

function mastodonGetAccessToken(code) {
    var protocol = (tootConfig.secure == 1 ? 'https' : 'http');
    var url = protocol + '://' + tootConfig.domain + '/oauth/token';
    var extension_id = chrome.runtime.id;

    var data = new FormData();
    var params = {
        'client_id': tootConfig.client_id,
        'client_secret': tootConfig.client_secret,
        'code': code,
        'grant_type': 'authorization_code',
        'scope': 'read write',
        'redirect_uri': 'chrome-extension://' + extension_id + '/tooter-callback.html',
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


function mastonValidateCredentials() {
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
