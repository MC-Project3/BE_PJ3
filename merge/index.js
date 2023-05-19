import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import mergeImages from 'merge-images';
import { Canvas, Image } from 'canvas';

const ddbClient = new DynamoDBClient();

export async function handler(event, context){
  try {
    const { playerId, teamId } = event.queryStringParameters
    const player = await getPlayerById(playerId);
    const team = await getTeamById(teamId);
    
    console.log(player, team)
    
    const mergedImage = await mergeImages(
      [player.body_shot_url, team.team_image_url], 
      { Canvas, Image }
    );
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: mergedImage.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message)
    };
  }
}


const getPlayerById = async (playerId) => {
    try{
        const params = {
            TableName : process.env.PLAYER_TABLE_NAME,
            Key: marshall({id: playerId})
        };

        const { Item } = await ddbClient.send(new GetItemCommand(params));
        return (Item) ? unmarshall(Item) : {};
    }catch(e){
        console.error(e);
        throw e;
    }
};

const getTeamById = async (teamId) => {
    try{
        const params = {
            TableName : process.env.TEAM_TABLE_NAME,
            Key: marshall({id: teamId})
        };

        const { Item } = await ddbClient.send(new GetItemCommand(params));
        return (Item) ? unmarshall(Item) : {};
      
    }catch(e){
        console.error(e);
        throw e;
    }
}