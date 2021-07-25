import * as Ask from 'ask-sdk';
import 'source-map-support/register';
import {
    ErrorHandler,
    HandlerInput,
    RequestHandler,
    SkillBuilders,
    PersistenceAdapter,
  } from 'ask-sdk-core';
  import {
    Response,
    SessionEndedRequest,
  } from 'ask-sdk-model';
import{
    DynamoDbPersistenceAdapter,
} from 'ask-sdk-dynamodb-persistence-adapter';
import{
    DynamoDB,
} from 'aws-sdk';

  const CancelAndStopIntentHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput : HandlerInput) : Response {

    const speechText = 'ねこやん';
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('ねこやん', speechText)
        .withShouldEndSession(true)      
        .getResponse();
    },
  };

// 現在日付の喋る用の文字列と検索用の文字列を作成する
  const make_mod_date = (today:Date):[string, string]=>{
    const today_year = today.getFullYear();
    const today_month = String(today.getMonth()+1);
    const today_date = String(today.getDate());
    const speak_date = `${today_year}ねん${today_month}がつ${today_date}にち`
    const search_date = `${today_year}${today_month.padStart(2, '0')}${today_date.padStart(2, '0')}`
    return [speak_date, search_date];
};

// 喋る用の時刻の文字列を返却する
const make_speak_time = (temp:string):string=>{
    const hour = String(Number(temp.substring(0, 2)));
    const minutes = String(Number(temp.substring(2, 4)));
    const second = String(Number(temp.substring(4)));
    const speak_time = `${hour}じ${minutes}ふん${second}びょう`
    return speak_time;
}

  const NekoyanHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      return true
    },
    async  handle(handlerInput : HandlerInput) : Promise<Response> {
        const dynamo =  new DynamoDB.DocumentClient({apiVersion: 'latest', region: 'us-east-1'});
        const current_date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
        const [speak_date, search_date] = make_mod_date(current_date);
        const query_param:DynamoDB.DocumentClient.QueryInput = {
            TableName: 'nekoyan',
            ExpressionAttributeNames:{'#date': 'nekoyan_date'},
            ExpressionAttributeValues:{':today': search_date},
            KeyConditionExpression:'#date = :today'
        };

        let resultText = '';
        const query_result = await dynamo.query(query_param, (err, data) =>{
            if (err) {
                resultText = `${speak_date}のねこやんはしっぱいしました。`
            } else {
                if (data.Items.length == 0){
                    resultText = `${speak_date}にねこやんはいません。`
                }else{
                    resultText = `${speak_date}のねこやんは`;
                    data.Items.forEach((temp)=>{
                        resultText += ` ${make_speak_time(temp.nekoyan_time)}にいました。`
                    });
                }
            }
        }).promise();

      return handlerInput.responseBuilder
        .speak(resultText)
        .getResponse();
    },
  };

  export const alexa = Ask.SkillBuilders.custom()
  .addRequestHandlers(
    NekoyanHandler,
  CancelAndStopIntentHandler)
  .withPersistenceAdapter(
    new DynamoDbPersistenceAdapter({
        tableName : 'nekoyan',
        partitionKeyName: 'nekoyan_date' ,
        createTable: false,
        dynamoDBClient: new DynamoDB({apiVersion: 'latest', region: 'us-east-1'})
    })
)
  .lambda();
  