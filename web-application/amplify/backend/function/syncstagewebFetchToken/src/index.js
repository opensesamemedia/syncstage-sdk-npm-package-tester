/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["syncstagesecret"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  // const https = require('https');
  // const aws = require('aws-sdk');

  // const doPostRequest = (data) => {
  //   return new Promise((resolve, reject) => {
  //     const options = {
  //       host: `${process.env.BASE_API_PATH || 'https://api.sync-stage.com'}`,
  //       path: '/sdk/web/login',
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     };
  //     console.log(JSON.stringify(options));

  //     //create the request object with the callback with the result
  //     const req = https.request(options, (res) => {
  //       resolve(JSON.stringify(res.statusCode));
  //     });

  //     // handle the possible errors
  //     req.on('error', (e) => {
  //       reject(e.message);
  //     });

  //     //do the request
  //     req.write(JSON.stringify(data));

  //     //finish the request
  //     req.end();
  //   });
  // };

  // const { Parameters } = await new aws.SSM()
  //   .getParameters({
  //     Names: ['syncstagesecret'].map((secretName) => process.env[secretName]),
  //     WithDecryption: true,
  //   })
  //   .promise();

  // // Assuming 'syncstagesecret' is present in the Parameters array
  // const syncStageSecretParameter = Parameters.find((param) => param.Name === 'syncstagesecret');

  // let syncStageSecretValue;

  // if (syncStageSecretParameter) {
  //   syncStageSecretValue = syncStageSecretParameter.Value;
  //   console.log('syncstagesecret value:', syncStageSecretValue);
  // } else {
  //   console.log('Parameter not found: syncstagesecret');
  // }
  // try {
  //   const response = await doPostRequest(syncStageSecretValue);
  //   return {
  //     statusCode: 200,
  //     //  Uncomment below to enable CORS requests
  //     //  headers: {
  //     //      "Access-Control-Allow-Origin": "*",
  //     //      "Access-Control-Allow-Headers": "*"
  //     //  },
  //     body: JSON.stringify(response.jwt),
  //   };
  // } catch (error) {
  //   console.error(error.message);
  //   if (error.response) {
  //     console.error('Response data:', error.response.data);
  //     console.error('Response status:', error.response.status);
  //     console.error('Response headers:', error.response.headers);
  //   }

  //   return {
  //     statusCode: 500,
  //     //  Uncomment below to enable CORS requests
  //     //  headers: {
  //     //      "Access-Control-Allow-Origin": "*",
  //     //      "Access-Control-Allow-Headers": "*"
  //     //  },
  //     body: JSON.stringify({ error: error.toString() }),
  //   };
  // }
}
