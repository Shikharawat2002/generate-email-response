document.querySelector('button').addEventListener('click', function () {
    // Open the interactive OAuth consent screen
    console.log("Consent screen starting");
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
        if (chrome.runtime.lastError || !token) {
            // Handle errors or user rejection
            console.error(chrome.runtime.lastError);
            return;
        }
        console.log("accessToken::", token)
        console.log("Consent screen end");

        // Call the function with the obtained token
        await makeApiRequest(token);
    });
    
    chrome.tabs.query({ active: true, currentWindow: true },async function (tabs) {
       await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getThread,
        });
    });

      //email id
      chrome.identity.getProfileUserInfo(async function(info) {  email = info.email;
        await console.log("email::", email) });

});


// document.getElementById('thread').addEventListener('click', function () {
    
// });

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

    // fetch(
    //     `https://gmail.googleapis.com/gmail/v1/users/shikhatesting0@gmail.com/threads`,
    //     init
    // )
    //     .then((response) => response.json())
    //     .then(function (data) {
    //         let userThreadData = data
    //         // console.log("userThreadData::",userThreadData);
    //         console.log("thread Ids::",  document.getElementById('threadIds'))
    //         const myList = document.getElementById('threadIds');
    //         let newArray = userThreadData.threads;
    //         // console.log("newArray", newArray);
    //         newArray.forEach(element => {
    //         const listItem = document.createElement('li');
    //         // listItem.innerHTML = `Id: ${element.id} , Snippet: ${element.snippet}`;
    //         listItem.innerHTML = `Snippet: ${element.snippet}`;
    //         myList.appendChild(listItem);
    //        });
    //     })
    //     .catch(function (error) {
    //         console.error('API request error:', error);
    //     });
}

async function getThread() {
    console.log('Get thread clicked');
    const getAllThreads =  document.querySelectorAll('.xY.a4W .bog span');
    let thread=[];
    let message = [];
    getAllThreads.forEach(element=>{
     thread.push(element.getAttribute('data-legacy-thread-id'));
     message.push(element.getAttribute('data-legacy-last-message-id'));
        // makeApiRequest(thread);
    })
    console.log("thread form js :::", thread);
    console.log("message form js :::", message);
    
    // const firstThreadElement = document.querySelector('.bqe');
    // if (firstThreadElement) {
    //     threadId = firstThreadElement.getAttribute('data-legacy-thread-id');
    //     messageId = firstThreadElement.getAttribute('data-legacy-last-message-id');
    //     console.log("Thread ID: ", threadId);
    //     console.log("Message ID: ", messageId);

    //     // Now that you have the threadId, you can proceed with the API request
    //     makeApiRequest(threadId);
    // } else {
    //     console.error('Thread element not found');
    // }
}

