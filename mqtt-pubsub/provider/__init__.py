import paho.mqtt.client as mqtt
import time
import requests
import datetime
import json
import os
import pandas as pd
from time import sleep


def on_connect(client, userdata, flags, rc):
    topics = [
        'roman/clusterdata/requests'
    ]

    print('Connected to %s' % (str(client._host)))
    for topic in topics:
        client.subscribe(topic)
        print(topic)


def on_message(client, userdata, msg):
    request = json.loads(msg.payload.decode('UTF-8'))
    table = request['table']
    usecols = request['cols']
    print("Requested " + table + " - columns " + str(usecols))
    publish(client, table, usecols)


def publish(client, table, usecols):
    for idx, filename in enumerate(os.listdir('./data/' + table)):
        filepath = os.path.join('./data/' + table, filename)
        print("Loading new file from table " + table + "...", end="")
        df = pd.read_csv(filepath, usecols=usecols)
        print("Done!")
        for idx, row in df.iterrows():
            topic = 'roman/clusterdata/' + table.replace('_', '')
            payload = row.to_json()
            client.publish(topic=topic,
                        payload=payload)
            # print('Published: %s to %s' % (payload, topic))
            sleep(0.001)


# def pack_message(row, table, column):
#     message = {}
#     if table == 'task_usage':
#         message['time_s'] = row[0]
#         message['time_e'] = row[1]
#     else:
#         message['time'] = row[0]
#     message['data'] = row[columns]
#     return json.dumps(message)


def createClient(host='broker.hivemq.com', port=1883, keepalive=60):
    client = mqtt.Client()
    client.connect(host=host, port=port, keepalive=keepalive)
    client.on_connect = on_connect
    client.on_message = on_message
    client.loop_forever()


if __name__ == '__main__':
    createClient()