import { TeradataConnection } from 'teradata-nodejs-driver'
import express from "express";
import { TeradataCursor } from 'teradata-nodejs-driver/teradata-cursor';
const API_KEY = process.env.API_KEY || 'GOOD_KEY';
const VANTAGE_HOST = process.env.VANTAGE_HOST || 'localhost';
const VANTAGE_PORT = process.env.VANTAGE_PORT || '1025';
const VANTAGE_USER = process.env.VANTAGE_USER || 'dbc';
const VANTAGE_PASSWORD = process.env.VANTAGE_PASSWORD || 'dbc';
const base64EncodedApiKey = 'Basic ' + Buffer.from(API_KEY + ':').toString('base64');
let teradataConnection:TeradataConnection = new TeradataConnection();

teradataConnection.connect({
  host: VANTAGE_HOST,
  dbs_port: VANTAGE_PORT,
  user: VANTAGE_USER,
  password: VANTAGE_PASSWORD,
  lob_support: 'true'
});

export function segmentWebhookListener (
  request: express.Request,
  response: express.Response
) {
  const data = Buffer.from(request.body.message.data, 'base64').toString('utf-8');
  const requestData = JSON.parse(data);
  requestData.receivedAt = request.body.message.publishTime;

  try {
    switch(requestData.type) {
      case 'track':
        insertTrack(requestData);
        break;

      case 'page':
        insertPage(requestData);
        break;

      case 'screen':
        insertScreen(requestData);
        break;

      case 'group':
        insertGroup(requestData);
        break;

      case 'identify':
        insertIdentifies(requestData);
        break;


      default:
        throw new Error(`Unknown event type: ${requestData.type}`);

    }
    response.status(200).send();
    return;
  } catch (error) {
    console.error(new Error(`Unable to save segment data to Vantage: ${error}`));
    response.status(500).send({ message: 'Unable to save segment data to Vantage.' });
    return;
  }
}

function insertTrack(requestData: any) {
  const data: any[] = [
    /* id */ requestData.messageId,
    /* received_at */ requestData.receivedAt,
    /* sent_at */ requestData.timestamp,
    /* user_id */ requestData.userId,
    /* properties */ JSON.stringify(requestData.properties),
    /* event_text */ requestData.event,
    /* email */ requestData.email,
  ];
  execute('insert into segment.tracks (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertPage(requestData: any) {
  const data: any[] = [
    /* id */ requestData.messageId,
    /* received_at */ requestData.receivedAt,
    /* sent_at */ requestData.timestamp,
    /* user_id */ requestData.userId,
    /* properties */ JSON.stringify(requestData.properties),
    /* page */ requestData.name,
    /* email */ requestData.email,
  ];
  execute('insert into segment.pages (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertScreen(requestData: any) {
  const data: any[] = [
    /* id */ requestData.messageId,
    /* received_at */ requestData.receivedAt,
    /* sent_at */ requestData.timestamp,
    /* user_id */ requestData.userId,
    /* properties */ JSON.stringify(requestData.properties),
    /* screen */ requestData.name,
    /* email */ requestData.email,
];
execute('insert into segment.screens (?, ?, ?, ?, ?, ?, ?)', data);
return;
}

function insertGroup(requestData: any) {
  const data: any[] = [
    /* id */ requestData.messageId,
    /* received_at */ requestData.receivedAt,
    /* sent_at */ requestData.timestamp,
    /* user_id */ requestData.userId,
    /* traits */ JSON.stringify(requestData.traits),
    /* group_id */ requestData.groupId,
    /* email */ requestData.email,
  ];
  execute('insert into segment.groups (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertIdentifies(requestData: any) {
  const data: any[] = [
    /* id */ requestData.messageId,
    /* received_at */ requestData.receivedAt,
    /* sent_at */ requestData.timestamp,
    /* user_id */ requestData.userId,
    /* traits */ JSON.stringify(requestData.traits),
    /* email */ requestData.email,
  ];
  execute('insert into segment.identifies (?, ?, ?, ?, ?, ?)', data);
  return;
}

export function execute(sql: string, data: any[]): void {
  let cursor;
  try {
    cursor = teradataConnection.cursor();
    cursor.execute(sql, data);
  } finally {
    if (cursor) cursor.close();
  }
  return;
}

export function connectionClose() {
  try {
    teradataConnection.close();
  } catch(error) {
    console.warn(new Error(`Couldn't cleanup connections: ${error}`));
  }
}
