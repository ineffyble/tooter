var tootConfig, mastodonPost;

var submitContainer, tootTextArea, tootContainer, tootButton, tweetTootButton, tweetButton, tootCharacterCounter;

chrome.storage.local.get('settings', function(res) {
    tootConfig = res.settings;
    if (tootConfig && tootConfig.access_token) {
        // Load Roboto font
        var fa = document.createElement('style');
        fa.type = 'text/css';
        fa.textContent = '@font-face { font-family: Roboto-Medium; src: url("'
                + chrome.extension.getURL('fonts/Roboto-Medium.ttf')
                + '"); }';
        document.head.appendChild(fa);

        // Wait until the UI is loaded
        var loader = document.querySelector('.js-app-loading.login-container');
        observer = new MutationObserver(function () {
            // Check if the loading overlay is now invisible
            if (loader.style.display == 'none') {
                // Make sure that the container is here
                submitContainer = document.querySelector('div.js-app-content.app-content div.cf.margin-t--12.margin-b--30');
                tootTextArea = document.querySelector('div.js-app-content.app-content div.position-rel.compose-text-container.padding-a--10 > textarea');
                if(submitContainer && tootTextArea) {
                    setup();
                    observer.disconnect();
                }
            }
        });
        observer.observe(loader, { attributes: true });
    }
});

function setup() {
    // Resize the character counter to put Tweet and Toot on the same line
    var tweetCharacterCount = submitContainer.querySelector('.character-count-compose');
    tweetCharacterCount.style.width = '40px';

    // Is used to to check if we can use Tweet+Toot
    tweetButton = submitContainer.querySelector('div:nth-child(1) > div > button');

    // Add a container under the Tweet/Tweet and Toot to add the Toot button
    tootContainer = document.createElement('div');
    tootContainer.setAttribute('class', 'pull-right margin-t--8');
    submitContainer.appendChild(tootContainer);

    var tootCharacterCounter = document.createElement('input');
    tootCharacterCounter.setAttribute('class', 'js-character-count character-count-compose margin-rl');
    tootCharacterCounter.setAttribute('disabled', '');
    tootCharacterCounter.value = 500;
    tootContainer.appendChild(tootCharacterCounter);

    addToIntentForm();

    // Observe the textArea to disable or enable the buttons
    tootTextArea.addEventListener('input', function() {
        tootCharacterCounter.value = 500 - tootTextArea.value.length;
        if(tootCharacterCounter.value < 0) {
            if(!tootCharacterCounter.classList.contains('invalid-char-count'))
                tootCharacterCounter.classList.add('invalid-char-count');
        } else {
            if(tootCharacterCounter.classList.contains('invalid-char-count'))
                tootCharacterCounter.classList.remove('invalid-char-count');
        }

        if(tweetButton.classList.contains('is-disabled')) {
            tweetTootButton.classList.add('is-disabled');
        } else if(tweetTootButton.classList.contains('is-disabled')) {
            tweetTootButton.classList.remove('is-disabled');
        }

        if(tootTextArea.value.length == 0 || tootTextArea.value.length > 500) {
            if(!tootButton.classList.contains('is-disabled'))
                tootButton.classList.add('is-disabled');
        } else {
            if(tootButton.classList.contains('is-disabled'))
                tootButton.classList.remove('is-disabled');
        }

        // if(tootTextArea.value.length == 0) {
        //     tootButton.classList.add('is-disabled');
        //     tweetTootButton.classList.add('is-disabled');
        // } else if(!tweetButton.classList.contains('is-disabled')) {
        //     tweetTootButton.classList.remove("is-disabled");
        // } else
        //     tootButton.classList.remove("is-disabled");
        //     if(!tweetButton.classList.contains('is-disabled'))
        //         tweetTootButton.classList.remove("is-disabled");
        // }
    }, false);

}

function errorStatus(text) {
    /*var html = `<p id="post-error" role="alert" class="error notice noarrow">${text}</p>`;
    document.querySelector('#bd').innerHTML = html;*/
}

function tootClicked(event) {
    event.preventDefault();
    if(tootButton.classList.contains('is-disabled')) return;

    var tootText = getTootText();
    mastodonPost(tootText)
        .then(function(t) {
            if (t.url) {
                // Disable the buttons
                if(!tootButton.classList.contains('is-disabled'))
                    tootButton.classList.add('is-disabled');
                if(!tweetTootButton.classList.contains('is-disabled'))
                    tweetTootButton.classList.add('is-disabled');
                // Clear the text area
                tootTextArea.value = '';
                tootCharacterCounter = 500;
                //TODO: add modal to display URL ?
                //window.location.href = t.url;
            } else {
                errorStatus('An error occurred');
            }
        })
        .catch(function(e) {
            errorStatus(`An error occurred: ${e}`);
        });
}

function tweetTootClicked(event) {
    event.preventDefault();
    if(tweetTootButton.classList.contains('is-disabled')) return;

    var tootText = getTootText();
    mastodonPost(tootText)
        .then(function(t) {
            if (t.url) {
                tweetButton.click();
                // Disable the buttons
                if(!tootButton.classList.contains('is-disabled'))
                    tootButton.classList.add('is-disabled');
                if(!tweetTootButton.classList.contains('is-disabled'))
                    tweetTootButton.classList.add('is-disabled');
                tootCharacterCounter = 500;
            } else {
                errorStatus('An error occurred.');
            }
        })
        .catch(function(e) {
            errorStatus(`An error occurred: ${e}`);
        });
}

function addToIntentForm() {
    addIntentButtonStyle();
    tootButton = newIntentButton('toot btn btn-positive btn-extra-height is-disabled', 'Toot');
    tootContainer.appendChild(tootButton);
    tootButton.addEventListener('click', tootClicked);

    tweetTootButton = newIntentButton('tweettoot btn btn-positive btn-extra-height is-disabled', 'Tweet and Toot');
    submitContainer.querySelector('div:nth-child(1)').appendChild(tweetTootButton);
    tweetTootButton.addEventListener('click', tweetTootClicked);
}

function addIntentButtonStyle() {
    var style = document.createElement('style');
    style.innerHTML = `
    .button.toot.selected {
        height: 40px;
        padding: 0 10px;
        border-color: #454b5e;
        background-color: #454b5e;
        color: white;
        font-family: Roboto-Medium, sans-serif;
    }

    .button.toot.selected.is-disabled {
        color: #1DA1F2;
    }

    .button.tweettoot.selected {
        height: 40px;
        border: transparent;
        border-right: 1px solid #454b5e;
        background: linear-gradient(90deg, #1DA1F2 0%, #1DA1F2 50%, #454b5e 50%, #454b5e 100%);
        font-family: Roboto-Medium, sans-serif;
    }`;
    document.head.appendChild(style);
}

function newIntentButton(classes, label) {
    var newButton = document.createElement('input');
    newButton.setAttribute('class', 'button selected ' + classes);
    newButton.setAttribute('type', 'submit');
    newButton.setAttribute('value', label);
    return newButton;
}

function getTootText() {
    var tootText = tootTextArea.value;
    if (quotedTweet = document.querySelector('.js-quote-tweet-holder .quoted-tweet')) {
        var accountLink = quotedTweet.querySelector('a.account-link').href;
        var tweetId = quotedTweet.dataset.tweetId;
        var tweetLink = accountLink + '/status/' + tweetId;
        tootText = tootText + ' ' + tweetLink;
    }
    return tootText;
}