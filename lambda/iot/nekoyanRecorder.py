import json
import boto3
from datetime import datetime, timedelta
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
  try:
    dynamoDB = boto3.resource("dynamodb")
    table = dynamoDB.Table("nekoyan") # DynamoDBのテーブル名
    # 日付の取得
    d_now = datetime.utcnow() + timedelta(hours=9)
    current_date = d_now.strftime('%Y%m%d')
    # 時刻の取得
    current_time = d_now.strftime('%H%M%S')
    # DynamoDBへのPut処理実行
    table.put_item(
      Item = {
        "nekoyan_date": current_date,
        "nekoyan_time": current_time,
      }
    )
    result_code = '200'
  except Exception as e:
    logger.error(e)
    result_code = '500' 
  
  return {"statusCode": result_code}
