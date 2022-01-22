const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.RESOPIA_SENDINBLUE_API_KEY;
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
// apikey.apiKeyPrefix = 'Token';

// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
// partnerKey.apiKeyPrefix = 'Token';

const apiInstance = new SibApiV3Sdk.EmailCampaignsApi();

const emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign(); // CreateEmailCampaign | Values to create a campaign
emailCampaigns.name = 'Campaign sent via the API';
emailCampaigns.subject = 'My subject';
emailCampaigns.sender = { name: 'From name', email: 'recipes21.com@gmail.com' };
emailCampaigns.type = 'classic';
emailCampaigns.templateId = 19;
emailCampaigns.recipients = { listIds: [4] };
emailCampaigns.params = { name: 'test API name' };

const fun = async () => {
  const campaign = await apiInstance.createEmailCampaign(emailCampaigns);
  console.log(campaign);
  const sendResult = await apiInstance.sendEmailCampaignNow(campaign.id);
  console.log(sendResult);
};

// TODO set more params to the template 19

fun().then(
  () => {
    console.log('done');
  },
  (error) => {
    console.error(error);
  },
);
