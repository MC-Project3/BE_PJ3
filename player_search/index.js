const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    // 기본적으로 모든 playerNAME 항목의 속성 값과 profile_photo_url 값을 조회
    const getAllItems = async () => {
      const params = {
        TableName: 'nba-info'
      };

      const result = await dynamoDB.scan(params).promise();
      return result.Items.map(item => ({
        id: item.id,
        name: item.playerNAME,
        bodyShotUrl: item.body_shot_url,
        imageUrl: item.profile_photo_url
      }));
    };

    // 사용자가 입력한 값으로 필터링하여 결과 반환
    const getFilteredItems = async (name) => {
      const params = {
        TableName: 'nba-info',
        FilterExpression: 'contains(playerNAME, :name)',
        ExpressionAttributeValues: {
          ':name': name
        }
      };

      const result = await dynamoDB.scan(params).promise();
      return result.Items.map(item => ({
         id: item.id,
        name: item.playerNAME,
        bodyShotUrl: item.body_shot_url,
        imageUrl: item.profile_photo_url
      }));
    };

    // 사용자가 입력한 name 값
    const name = event.queryStringParameters && event.queryStringParameters.name;

    let items;

    // name 값이 없으면 모든 항목을 조회하여 반환
    if (!name) {
      items = await getAllItems();
    } else {
      // name 값이 존재하면 필터링하여 반환
      items = await getFilteredItems(name);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
};
