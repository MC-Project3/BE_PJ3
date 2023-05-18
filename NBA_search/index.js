const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const resource = event.resource;
    
    if (resource === '/players') {
      return await handlePlayersResource(event);
    } else if (resource === '/teams') {
      return await handleTeamsResource(event);
    } else {
      throw new Error('Invalid resource');
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
};

const handlePlayersResource = async (event) => {
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
    const uppercaseName = name.toUpperCase();
    const params = {
      TableName: 'nba-info',
      FilterExpression: 'contains(playerNAME, :name)',
      ExpressionAttributeValues: {
        ':name': uppercaseName
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
};

const handleTeamsResource = async (event) => {
  // 기본적으로 모든 team의 값을 조회
  const getAllItems = async () => {
    const params = {
      TableName: 'nba-teaminfo'
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items.map(item => ({
      id: item.id,
      team: item.teamNAME,
      teamImageUrl: item.team_image_url

    }));
  };

  // 사용자가 입력한 값으로 필터링하여 결과 반환
  const getFilteredItems = async (team) => {
    const uppercaseTeam = team.toUpperCase(); //입력값 대문자로 변환 
    const params = {
      TableName: 'nba-teaminfo',
      FilterExpression: 'contains(teamNAME, :team)',
      ExpressionAttributeValues: {
        ':team': uppercaseTeam
      } //(쿼리식 안에는 UPPER함수 사용하면 ERROR남)"invalid filterexpression: invalid function name; function: upper"
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items.map(item => ({
       id: item.id,
       team: item.teamNAME,
       teamImageUrl: item.team_image_url
    }));
  };

  // 사용자가 입력한 team 값
  const team = event.queryStringParameters && event.queryStringParameters.team;

  let items;

  // name 값이 없으면 모든 항목을 조회하여 반환
  if (!team) {
    items = await getAllItems();
  } else {
    // team 값이 존재하면 필터링하여 반환
    items = await getFilteredItems(team);
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
}
