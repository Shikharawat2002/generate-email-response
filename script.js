document.querySelector('button').addEventListener('click', function () {
    // Open the interactive OAuth consent screen
    console.log("Consent screen starting");
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError || !token) {
            // Handle errors or user rejection
            console.error(chrome.runtime.lastError);
            return;
        }
        console.log("accessToken::", token)
        console.log("Consent screen end");

        // Call the function with the obtained token
        makeApiRequest(token);
    });
});

let threadId;
let messageId;

document.getElementById('thread').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getThread,
        });
    });
});

async function makeApiRequest(token) {
    // Use the obtained token and threadId to make authorized API requests
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };

    fetch(
        `https://gmail.googleapis.com/gmail/v1/users/shikhatesting0@gmail.com/threads`,
        init
    )
        .then((response) => response.json())
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.error('API request error:', error);
        });
}

async function getThread() {
    console.log('Get thread clicked');
    const firstThreadElement = document.querySelector('.bqe');
    if (firstThreadElement) {
        threadId = firstThreadElement.getAttribute('data-legacy-thread-id');
        messageId = firstThreadElement.getAttribute('data-legacy-last-message-id');
        console.log("Thread ID: ", threadId);
        console.log("Message ID: ", messageId);

        // Now that you have the threadId, you can proceed with the API request
        makeApiRequest(threadId);
    } else {
        console.error('Thread element not found');
    }
}
