import track1 from './data/track1.json';
import page1 from './data/page1.json';
import screen1 from './data/screen1.json';
import group1 from './data/group1.json';
import identifies1 from './data/identifies1.json';

let executeMock = jest.fn();

jest.mock('teradata-nodejs-driver', () => {
  return {
    TeradataConnection: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn(),
        close: jest.fn(),
        cursor: jest.fn(() => ({
          execute: executeMock,
          close: jest.fn()
        }))
      }
    })
  }
});

const httpResponseMockStatus = jest.fn();
const httpResponseMockSend = jest.fn();
const httpResponse = {
  status: httpResponseMockStatus.mockReturnValue({
    send: httpResponseMockSend,
  }),
  end: jest.fn()
}

const spyConsoleError: jest.SpyInstance = jest.spyOn(global.console, 'error');

afterEach(() => {
  jest.clearAllMocks();
})

test.each([{
  when: { body: track1 },
  then: {
    query: 'insert into segment.tracks (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'segment-test-message-nh4t58',
      '2022-01-20T17:37:54.099Z',
      '2022-01-20T17:07:37.110Z',
      'test-user-xuonv',
      '{"property1":1,"property2":"test","property3":true}',
      'Segment Test Event Name',
      'test@example.org']
  }
},
{
  when: { body: page1 },
  then: {
    query: 'insert into segment.pages (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'segment-test-message-6rh4qn',
      '2022-01-20T17:37:54.099Z',
      '2022-01-20T18:56:58.482Z',
      'test-user-btsn1c',
      '{"property1":1,"property2":"test","property3":true}',
      'Home Page',
      'test@example.org']
  }
},
{
  when: { body: screen1 },
  then: {
    query: 'insert into segment.screens (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'segment-test-message-svn02',
      '2022-01-20T17:37:54.099Z',
      '2022-01-20T19:50:21.872Z',
      'test-user-x3scag',
      '{"property1":1,"property2":"test","property3":true}',
      'Home View',
      'test@example.org']
  }
},
{
  when: { body: group1 },
  then: {
    query: 'insert into segment.groups (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'segment-test-message-p12taph',
      '2022-01-20T17:37:54.099Z',
      '2022-01-20T18:50:59.950Z',
      'test-user-6bjn4',
      '{"trait1":1,"trait2":"test","trait3":true}',
      'test-group-vkhcxo',
      'test@example.org'
    ]
  }
},
{
  when: { body: identifies1 },
  then: {
    query: 'insert into segment.identifies (?, ?, ?, ?, ?, ?)',
    queryParams: [
      'segment-test-message-kp53r',
      '2022-01-20T17:37:54.099Z',
      '2022-01-20T19:58:24.044Z',
      'test-user-9nu80p',
      '{"trait1":1,"trait2":"test","trait3":true}',
      'test@example.org'
    ]
  }
}
])('%# when event received, then it should return success',
  async (data) => {
    const body = data.when.body;
    const query = data.then.query;
    const queryParams = data.then.queryParams;
    (await import('../src/segmentWebhookListener')).segmentWebhookListener(
      { body } as any, httpResponse as any
    );
    expect(executeMock).toBeCalledWith(query, queryParams);
    expect(httpResponseMockStatus).toBeCalledWith(200);
  },);

test('should log error if unable to update Vantage', async () => {
  const body = identifies1;
  const error = "unknown error";
  executeMock.mockImplementation(() => {throw new Error('unknown error')});
  (await import('../src/segmentWebhookListener')).segmentWebhookListener(
    { body, } as any, httpResponse as any
  );
  executeMock.mockImplementation();
  expect(spyConsoleError.mock.calls[0][0].message).toStrictEqual(expect.stringContaining(`Unable to save segment data to Vantage: Error: ${error}`));
  expect(httpResponseMockStatus).toBeCalledWith(500);
  expect(httpResponseMockSend).toBeCalledWith({message: 'Unable to save segment data to Vantage.'});
});
