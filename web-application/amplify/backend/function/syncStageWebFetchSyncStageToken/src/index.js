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
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const axios = require('axios');
  const aws = require('aws-sdk');

  const { Parameters } = await new aws.SSM()
    .getParameters({
      Names: ['syncstagesecret'].map((secretName) => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();

  console.log(Parameters);

  let syncStageSecret = '';

  if (Parameters) {
    syncStageSecret = Parameters[0].Value;
    console.log('syncstagesecret value:', syncStageSecret);
  } else {
    console.log('Parameter not found: syncstagesecret');
  }
  try {
    const path = `${process.env.BASE_API_PATH || 'https://api.sync-stage.com'}/sdk/web/login`;

    console.log(path);

    const response = await axios.post(path, syncStageSecret, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { jwt } = response.data;
    return {
      statusCode: 200,
      //  Uncomment below to enable CORS requests
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: jwt,
    };
  } catch (error) {
    console.error(error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }

    return {
      statusCode: 500,
      //  Uncomment below to enable CORS requests
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: error.toString() }),
    };
  }
  // return {
  //   statusCode: 200,
  //   //  Uncomment below to enable CORS requests
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Headers': '*',
  //   },
  //   body: JSON.stringify('Hello from Lambda!'),
  // };
};
