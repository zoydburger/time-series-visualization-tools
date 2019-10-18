import paho.mqtt.client as mqtt
from streamhelper import get_empty_types
import json
import publisher as pub
import threading

pause_events = get_empty_types()


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
    print("Received request: ", end='')
    print(request)
    action = request['action']
    table = request['table']
    streamtype = request['streamtype']
    if action == 'start':
        process = threading.Thread(target=send_request, args=[table, streamtype])
        process.start()
    elif action == 'stop':
        print(pause_events[table][streamtype])
        pause_events[table][streamtype].set()
    # elif action == 'reset':
    #     pub.reset_state(table, streamtype)
    # else:
    #     print("WARNING: Could not process request.")


def send_request(table, streamtype):
    event = threading.Event()
    pause_events[table][streamtype] = event
    pub.Publisher(event, table, streamtype).run()


def create_client(host='broker.hivemq.com', port=1883, keepalive=60):
    client = mqtt.Client()
    client.connect(host=host, port=port, keepalive=keepalive)
    client.on_connect = on_connect
    client.on_message = on_message
    client.loop_forever()


if __name__ == "__main__":
    create_client()
