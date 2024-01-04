document.querySelector('button').addEventListener('click', async function () {

    //Step1. Authentication setup to get token
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
        if (chrome.runtime.lastError || !token) {
            console.error(chrome.runtime.lastError);
            return;
        }



        //Step 2. Get message ID, EmailId make api request to fetch the message data
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            //reading messageID
            const getMessageId = await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getMessage,
            });
            const messageId = getMessageId[0]?.result;  
            //read user email ID
             chrome.identity.getProfileUserInfo({accountStatus: 'ANY'}, function (info) {
                const email = info.email;
                // Pass messageId and email to makeApiRequest
               const messageResponse =  makeApiRequest(token, messageId, email);


                     //Step 3. Add response 
                     //    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                         //     const getChatRes = await chrome.scripting.executeScript({
                             //         target: { tabId: tabs[0].id },
                             //         function: generateResponse,
                             //     });
            const getChatRes = generateResponse(messageResponse)
            console.log("getChatRes::", getChatRes[0]?.result)
            chrome.tabs.query({active:true, currentWindow: true}, async function (tabs){
                chrome.scripting.executeScript({
                    target:{tabId:tabs[0].id},
                    function: function addResponse(getChatRes)
                    {
                        console.log("Response:::",getChatRes )
                        // document.querySelector('.aO7 .editable').innerHTML = getChatRes[0].result;
                        // console.log("Mess append")
                        
                    }
                })
               })
            
        });
            });
        });

    });




async function makeApiRequest(token,messageId,email) {
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


    console.log("email::", email)
    console.log("messageId::", messageId)
    console.log("Token::", token)


    fetch(`https://gmail.googleapis.com/gmail/v1/users/${email}/threads/${messageId}`,init)
    .then(async response => await  response.json())
    .then(data =>{
        //get messages
        let messagePayload=[];
        for (let index = 0; index < data?.messages?.length; index++) 
        {
            // console.log("\n index", index)
            const element = data?.messages[index]
            // console.log("element", element)
            const encodedString = element.payload?.parts[0]?.body?.data
            console.log("encodedString::", encodedString)
            messagePayload.push(encodedString);
        }
        console.log("messagepayload::", messagePayload)
        const newMessagePayload = messagePayload.join(",");
        console.log("newMessagePAyload::", newMessagePayload);

        return newMessagePayload;
    })
    .catch(error => console.error('Error:', error));
}




 function getMessage()
{
    const getMessageId = document.querySelector('.adn.ads').getAttribute('data-legacy-message-id');
    // console.log("getMessageID in mainfunction::", getMessageId)
    return getMessageId;
}



async function generateResponse(mailMessages)
{

    
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: `You role is to decode this data and generate a email response based on this conversation:: ${mailMessages}` },
        ],
        model: "gpt-3.5-turbo-1106"
      }),
    });

    const responseData = await response.json();
    // const chatRes = JSON.parse(responseData.choices[0].message.content);
        const chatRes = responseData?.choices[0]?.message?.content;
    console.log("chatREs in function::",chatRes);
    return chatRes;
}

