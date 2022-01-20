import track1 from '../data/track1.json';
import page1 from '../data/page1.json';
import screen1 from '../data/screen1.json';
import group1 from '../data/group1.json';
import identifies1 from '../data/identifies1.json';
import * as app from '../../src/app';
import request from 'supertest';
import * as db from './db';

const spyConsoleError: jest.SpyInstance = jest.spyOn(global.console, 'error');

beforeAll(() => {
  db.connect();
})

afterEach(() => {
  jest.clearAllMocks();
})

afterAll(() => {
  app.close();
  db.close();
})


test.each([
  { when: { body: track1, table: 'tracks' } },
  { when: { body: page1, table: 'pages' } },
  { when: { body: screen1, table: 'screens' } },
  { when: { body: group1, table: 'groups' } },
  { when: { body: identifies1, table: 'identifies' } }
])(`%# when event is received, then it should return success`,
  async (data) => {
    const body = data.when.body;
    const table = data.when.table;
    const before = db.select(`SEL count(*) FROM segment.${table}`)[0][0];
    await request(app.app)
      .post('/')
      .send(body)
      .expect(200);
    expect(db.select(`SEL count(*) FROM segment.${table}`)[0][0]).toEqual(parseInt(before)+1);
  },);
