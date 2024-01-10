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
       console.log("accessToKen", accessToken)
    if(accessToken)
    {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('button').style.display = 'block';
    }
    else{
        alert("Invalid Sign In")
    }
    });
    
})


document.getElementById('button').addEventListener('click', async function(){
    // console.log("token in res::", accessToken)  
    showLoader();

    //Step 2: Get EmailId:
    chrome.identity.getProfileUserInfo({accountStatus: 'ANY'}, async function(info)
    {
        emailId= info?.email;
        // console.log("email identity:::", emailId)
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
        // console.log("messagesID chrome::", messageId);

        if(messageId){
           // Step 4: Call API To read Threads(get encoded response): 
         try {
            encodedMessage = await makeApiRequest(accessToken, emailId, messageId);
            // console.log("encodedMessage to pass in generate response function:::", encodedMessage);

            // Step 5: Get Mail Response from chatGpt
            if(encodedMessage)
            {
                const getChatRes = await generateResponse(encodedMessage);
                // chatGptResponse = await getChatRes[0]?.result;
                chatGptResponse = getChatRes;
                console.log("chatGptResponse after function call:::", chatGptResponse);
                if(chatGptResponse)
                {
                    chrome.tabs.query({active:true, currentWindow: true}, async function(tabs)
                    {
                        chrome.scripting.executeScript({
                            target:{tabId: tabs[0].id},
                            function: fillResponse,
                            args:[chatGptResponse]
                        })
                    })
                }
            }
         
        } catch (error) {
            console.error('Error in API request:', error);
        }
        finally{
            hideLoader();
        }  
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

    // console.log("email in Api ::", emailId);
    // console.log("messageId in api ::", messageId);
    // console.log("accessTOke in APi::", accessToken);

    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${emailId}/threads/${messageId}`, init);
        const data = await response.json();

        let messagePayload = [];
        for (let index = 0; index < data?.messages?.length; index++) {
            const element = data?.messages[index];
            if(element.payload?.parts)
            {

                const encodedString = element.payload?.parts[0]?.body?.data;
                messagePayload.push(encodedString);
            }
            else{
                const encodedString = element.payload?.body?.data;
                messagePayload.push(encodedString);
            }
        }

        const newMessagePayload = messagePayload.join(",");
        // console.log("newMessagePayload::", newMessagePayload);

        return newMessagePayload;
    } catch (error) {
        console.error('Error in makeApiRequest:', error);
        throw error; 
    }
}


async function getMessage()
{
    // const getMessageId = await document.querySelectorAll('.adn.ads')[0].getAttribute('data-legacy-message-id');
        const getMessageId = await document.querySelectorAll('.ha h2')[0].getAttribute('data-legacy-thread-id');

    // console.log("getMessageID in mainfunction::", getMessageId)
    return getMessageId;
}


async function generateResponse(mailMessages) {
    console.log("enocoded mail inside generate Res:: ", mailMessages);
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: `Your role is decoding this mail: ${mailMessages} and after getting decoded mail , return only Generated reply,greet the user  and express gratitude` },
                ],
                model: "gpt-3.5-turbo-1106"
            }),
        });

        const responseData = await response.json();

        // Ensure that the response contains choices array and is not empty
        if (responseData.choices && responseData.choices.length > 0) {
            const chatRes = responseData.choices[0].message.content;
            // console.log("chatREs in function::", chatRes);
            return chatRes;
        } else {
            console.error('Invalid response from OpenAI API');
            throw new Error('Invalid response from OpenAI API');
        }
    } catch (error) {
        console.error('Error in generateResponse:', error);
        throw error; // Rethrow the error to propagate it through the promise chain
    }
}

async function fillResponse(chatGptResponse)
{
    console.log("fillResponse:::", chatGptResponse)
    document.querySelector('.amn .bkH').click()
    setTimeout(() => {
        console.log("query ",document.querySelector('.aO7 .editable') )
        document.querySelector('.aO7 .editable').innerHTML = chatGptResponse;
      }, 1000)
   
}


//function to show loader
function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}

// Function to hide the loader
function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}