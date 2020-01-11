// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');
// const { ContactImporter } = require('@sendgrid/contact-importer');
const client = require('@sendgrid/client');

client.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: 'andres.canavesi@gmail.com',
    from: 'noresponder@resopia.com',
    subject: 'Prueba de sendgrid 2',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    templateId: 'd-0c1b5d051ae549d1963b0a9a1a92248c',
    dynamic_template_data: {
      subject: 'Testing Templates Stuff',
      name: 'Andres',
      city: '<b>Denver<b>',
    },
  };
  sgMail.send(msg);
}

function importContact() {
//   const request = {
//     method: 'GET',
//     url: '/v3/marketing/contacts/count',
//   };

  const listId = '73bf7bb2-e847-48d9-bd69-10e817145be1';
  const data = {
    list_ids: [listId],
    contacts: [{
      email: 'victoria.armario@gmail.com',
      first_name: 'Victoria',
      last_name: 'Armario',
    }],
  };

  //   const request = {
  //     method: 'PUT',
  //     url: '/v3/marketing/contacts',
  //     body: data,
  //   };

  //   const request = {
  //     method: 'GET',
  //     url: '/v3/marketing/contacts',
  //   };

  //   const request = {
  //     method: 'GET',
  //     url: '/v3/contactdb/lists',
  //   };

  //   const request = {
  //     method: 'GET',
  //     url: '/v3/marketing/lists',
  //   };

  const request = {
    method: 'GET',
    url: `/v3/marketing/lists/${listId}`,
  };

  //   const dataList = { name: 'api_list' };
  //   const request = {
  //     method: 'POST',
  //     url: '/v3/marketing/lists',
  //     body: dataList,
  //   };


  client.request(request)
    .then(([response, body]) => {
      console.log(response.statusCode);
      console.log(body);
    }).catch((error) => {
      console.error(error);
    });
}

importContact();
