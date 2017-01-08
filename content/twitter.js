var tootConfig;

chrome.storage.local.get("settings", function(res) {
    tootConfig = res.settings;
    if (tootConfig && tootConfig.access_token) {
        run();
    }
});

function run() {
    var path = window.location.pathname;
    switch (true) {
    case /intent\/tweet/.test(path):
        addToIntentForm();
        break;
    }
}

function tootClicked(event) {
    event.preventDefault();
    var tootText = document.querySelector('#status').value;
    mastodonPost(tootText)
        .then(function(t) {
            if (t.url) {
                window.location.href = t.url;
            } else {
                var error = document.createElement('div');
                error.innerHTML = '<p id="post-error" role="alert" class="error notice noarrow">An error occured.</p>';
                document.querySelector('#bd').appendChild(error);
            }
        });
}

function tweetTootClicked(event) {
    event.preventDefault();
    var tootText = document.querySelector('#status').value;
    var tweetButton = document.querySelector('input.submit');
    mastodonPost(tootText)
        .then(function(t) {
            if (t.url) {
                tweetButton.click();
            } else {
                var error = document.createElement('div');
                error.innerHTML = '<p id="post-error" role="alert" class="error notice noarrow">An error occured.</p>';
                document.querySelector('#bd').appendChild(error);
            }
        });
}

function addToIntentForm() {
    var submitFields = document.querySelector('fieldset.submit');
    var style = document.createElement('style');
    style.innerHTML = `
    .button.toot.selected { 
            border-color: #454b5e; 
            background-color: #454b5e; 
            margin-right: 3px;
    }
    .button.tweettoot.selected {
            border-color: #454b5e;
            background: linear-gradient(90deg, #1da1f2 0%, #1da1f2 50%, #454b5e 50%, #454b5e 100%)
    }`;
    submitFields.appendChild(style);
    var tootButton = document.createElement('input');
    tootButton.setAttribute('class', 'button selected toot');
    tootButton.setAttribute('type', 'submit');
    tootButton.setAttribute('value', 'Toot');
    submitFields.appendChild(tootButton);
    var tweetTootButton = document.createElement('input');
    tweetTootButton.setAttribute('class', 'button selected tweettoot');
    tweetTootButton.setAttribute('type', 'submit');
    tweetTootButton.setAttribute('value', 'Tweet and Toot');
    submitFields.appendChild(tweetTootButton);
    tootButton.addEventListener('click', tootClicked);
    tweetTootButton.addEventListener('click', tweetTootClicked);
    tootButton.addEventListener();
}
