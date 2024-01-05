var  accessToken ;
var emailId;
var threadId;
var messageId;
var encodedMessage;
var chatGptResponse;

document.getElementById('auth').addEventListener('click', async function () {
    //Step1. Authentication setup to get token
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
        if (chrome.runtime.lastError || !token) {
            console.error(chrome.runtime.lastError);
            return;
        }
        accessToken = token;
       console.log("accessTOKen", accessToken)
    });

    
})


document.getElementById('button').addEventListener('click', async function(){
    console.log("token in res::", accessToken)  

    //Step 2: Get EmailId:
    chrome.identity.getProfileUserInfo({accountStatus: 'ANY'}, async function(info)
    {
        emailId= info?.email;
        console.log("email identity:::", emailId)
    })

    //Step 3: Get messageID: 
    chrome.tabs.query({active:true, currentWindow: true}, async function (tabs)
    {
        const getMessageId =await chrome.scripting.executeScript({
            target:{tabId: tabs[0].id},
            function :  getMessage,
        })
        // messageId = getMessageId[0]?.result;
        messageId = getMessageId[0].result;
        console.log("messagesID chrome::", messageId);

         // Step 4: Call API To read Threads(get encoded response):
         try {
            encodedMessage = await makeApiRequest(accessToken, emailId, messageId);
            console.log("encodedMessage to pass in generate response function:::", encodedMessage);

            // Step 5: Get Mail Response from chatGpt
            const getChatRes = await generateResponse(encodedMessage);
            chatGptResponse = getChatRes[0]?.result;
        } catch (error) {
            console.error('Error in API request:', error);
        }
    })
 });
         

 async function makeApiRequest(accessToken, emailId, messageId) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };

    console.log("email in Api ::", emailId);
    console.log("messageId in api ::", messageId);
    console.log("accessTOke in APi::", accessToken);

    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${emailId}/threads/${messageId}`, init);
        const data = await response.json();

        let messagePayload = [];
        for (let index = 0; index < data?.messages?.length; index++) {
            const element = data?.messages[index];
            const encodedString = element.payload?.parts[0]?.body?.data;
            messagePayload.push(encodedString);
        }

        const newMessagePayload = messagePayload.join(",");
        console.log("newMessagePayload::", newMessagePayload);

        return newMessagePayload;
    } catch (error) {
        console.error('Error in makeApiRequest:', error);
        throw error; // Rethrow the error to propagate it through the promise chain
    }
}


async function getMessage()
{
    const getMessageId = await document.querySelector('.adn.ads').getAttribute('data-legacy-message-id');
    // console.log("getMessageID in mainfunction::", getMessageId)
    return getMessageId;
}



async function generateResponse(mailMessages)
{
    console.log("enocode mail inside generate REs:: ", mailMessages)
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
          { role: "user", content: `You role is after decoding this ${mailMessages} generate the response for mail` },
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

