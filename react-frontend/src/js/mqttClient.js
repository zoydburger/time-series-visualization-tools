import Paho from 'paho-mqtt';
import { timestampToPlotlyTimestamp } from './helper';

const host = 'broker.hivemq.com';
const port = Number(8000);
const topicPrefix = 'roman/clusterdata/';
// The port here is the "http" port we specified on the MQTT Broker
var clientID = 'web' + new Date().getTime();
var client = new Paho.Client(host, port, clientID);

const maxStamps = 100;
let activeRequests = {};

let graphData = {};

export let foreCastData = {
  time: [],
  values: [],
  timeForecasts: [],
  forecasts: [],
};

function parseMessage(res) {
  if (res.type == 'forecasts') {
    const maxTS = 40;
    foreCastData.time.push(res.time);
    foreCastData.values.push(res.value);

    if (foreCastData.time.length > maxTS) {
      foreCastData.time.shift();
      foreCastData.values.shift();
    }
    if (res.time > 20) {
      foreCastData.forecasts.push(res.forecast);
      foreCastData.timeForecasts.push(res.timefc);
      if (foreCastData.timeForecasts.length > maxTS) {
        foreCastData.forecasts.shift();
        foreCastData.timeForecasts.shift();
      }
    }
  } else {
    if (!graphData[res.table]) graphData[res.table] = {};
    if (!graphData[res.table][res.type])
      graphData[res.table][res.type] = {
        x: [],
        y: {},
      };
    updateData(res.table, res.type, res.time, res.data);
  }
}

function updateData(table, type, time, data) {
  const plotlyTS = timestampToPlotlyTimestamp(time);
  graphData[table][type].x.push(plotlyTS);
  const len = graphData[table][type].x.length;
  if (len >= maxStamps) graphData[table][type].x.shift();
  for (let key in data) {
    const val = data[key];
    if (!graphData[table][type].y[key]) graphData[table][type].y[key] = [val];
    else graphData[table][type].y[key].push(val);
    if (len >= maxStamps) graphData[table][type].y[key].shift();
  }
}

export function getGraphData(table, type) {
  if (graphData[table] && graphData[table][type]) {
    return graphData[table][type];
  }
  return undefined;
}

// function updataEvents(res) {
//   eventData.time.push(timestampToPlotlyTimestamp(Number(res.time)));
//   eventData.pending.push(res['pending']);
//   eventData.running.push(res['running']);
//   eventData.dead.push(res['dead']);
//   eventData.finish.push(res['finish']);
//   console.log(eventData.time.length);
//   if (eventData.time.length >= maxStamps) {
//     for (let item in eventData) {
//       eventData[item].shift();
//     }
//   }
//   //console.log(data);
// }

// function updateDiffcounter(res) {
//   diffData.time.push(Number(res.time));
//   diffData.scheduled.push(res['scheduled']);
//   diffData.submit.push(res['submit']);
//   diffData.resubmit.push(res['resubmit']);
//   diffData.deschedule_pending.push(res['deschedule_pending']);
//   diffData.deschedule_running.push(res['deschedule_running']);
//   if (diffData.time.length >= maxStamps) {
//     for (let item in diffData) {
//       item.shift();
//     }
//   }
//   //console.log(data);
// }

const topics = ['jobs/accumulate', 'jobs/difference', 'usage/forecast'];

export let connected = false;
export let requested = false;
// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

// called when the client connects
function onConnect() {
  // Once a connection has been made, make topic subscriptions
  console.log('onConnect');
  topics.forEach(topic => client.subscribe(topicPrefix + topic));
  connected = true;
}
// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('onConnectionLost:' + responseObject.errorMessage);
  }
  activeRequests = {};
  connected = false;
}

function changeStatus(table, streamtype) {
  if (activeRequests[table])
    activeRequests[table][streamtype] = !Boolean(
      activeRequests[table][streamtype],
    );
  else activeRequests[table] = { streamtype: true };
  console.log(activeRequests);
}

export function streamRequest(action, table, streamtype) {
  console.log('New ' + action + ' request: ' + table + '/' + streamtype);
  if (connected) {
    const msg = {
      action: action,
      table: table,
      streamtype: streamtype,
    };
    let message = new Paho.Message(JSON.stringify(msg));
    message.destinationName = topicPrefix + 'requests';
    client.send(message);
    changeStatus(table, streamtype);
  } else {
    console.log('Client not connected.');
  }
}

export function requestTable(table, cols) {
  if (connected && !requested) {
    const msg = {
      table: table,
      cols: cols,
    };
    let message = new Paho.Message(JSON.stringify(msg));
    message.destinationName = topicPrefix + 'requests';
    console.log('Sending request', message);
    client.send(message);
    requested = true;
  } else {
    console.log('Client not connected.');
  }
}

function onMessageArrived(msg) {
  const res = JSON.parse(msg.payloadString);
  parseMessage(res);
}

export default client;
