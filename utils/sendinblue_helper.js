const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.RESOPIA_SENDINBLUE_API_KEY_V3;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
// apiKey.apiKeyPrefix['api-key'] = "Token"

// Configure API key authorization: partner-key
// const partnerKey = defaultClient.authentications['partner-key'];
// partnerKey.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
// partnerKey.apiKeyPrefix['partner-key'] = "Token"

// const api = new SibApiV3Sdk.AccountApi();
// api.getAccount().then((data) => {
//     console.log(`API called successfully. Returned data: ${JSON.stringify(data)}`);
//   }, (error) => {
//     console.error(error);
//   });

const api = new SibApiV3Sdk.SMTPApi();

// sender: {
//     name: 'Resopia 2',
//     email: 'nodesponder@resopia.com',
//   },

const sendSmtpEmail = {
  to: [{
    email: 'andres.canavesi@gmail.com',
    name: 'Andres Canavesi',
  }],
  templateId: 10,
  params: {
    name: 'John',
    surname: 'Doe',
  },
  headers: {
    'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
  },
};


api.sendTransacEmail(sendSmtpEmail).then((data) => {
  console.log(`API called successfully. Returned data: ${JSON.stringify(data)}`);
}, (error) => {
  console.error(error);
});
