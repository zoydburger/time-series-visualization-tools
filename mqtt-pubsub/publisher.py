import paho.mqtt.client as mqtt
import time
import os
import pandas as pd
import json
import filehelper as fh
import threading
from streamhelper import cfg_streams, fake_forecast
import timehelper as th
import numpy as np

publisher = mqtt.Client()
publisher.connect('broker.hivemq.com')
print('connected to %s' % publisher._host)
states = {}
time_factor = 100

def init_sets(table, stream):
    sets = {}
    for key in cfg_streams[table][stream]['sets']:
        sets[key] = set({})
    return sets


def update_sets(event, job, sets):
    if event == 0:
        sets['pending'].update([job])
        sets['dead'].difference_update([job])
    elif event == 1:
        sets['running'].update([job])
        sets['pending'].difference_update([job])
    elif event in [2, 3, 4, 5, 6]:
        sets['running'].difference_update([job])
        sets['pending'].difference_update([job])
        sets['dead'].update([job])


def reset_state(tname, stream):
    states[tname][stream] = {
        'idx': 0,
        'row': 0,
        'sets': init_sets(tname, stream)
    }


class Publisher(threading.Thread):

    def __init__(self, event, table, streamtype):
        print("New publisher for table " + table + " streaming " + streamtype)
        self.cfg = cfg_streams[table][streamtype]
        threading.Thread.__init__(self)
        self.event = event
        self.table = table
        self.streamtype = streamtype
        self.idx = 0
        self.row = 0
        self.sets = init_sets(table, streamtype)
        self.published = False
        self.set_state()

    def run(self):
        while not self.event.is_set():
            if self.streamtype == 'forecast':
                data = fake_forecast()
                split = 20
                payload = {}
                for ts in data['time']:
                    print(ts)
                    payload['time'] = str(ts)
                    payload['value'] = str(data['values'][ts])
                    if ts > split and ts < len(data['time']) - split:
                        payload['timefc'] = str(data['time'][ts + split])
                        payload['forecast'] = str(data['forecasts'][ts + split])
                    payload = json.dumps(payload)
                    publisher.publish(topic=self.cfg['topic'], payload=payload)
            else:
                for file_idx, filename in enumerate(os.listdir('./data/' + self.table)):
                    if file_idx < self.idx:
                        print("Skipped file " + str(file_idx))
                        continue
                    else:
                        df = self.load_df(filename)
                        self.publish(df)
                        #next_publish = self.cfg['t_min'] + self.cfg['t_step']
                        #last_ts = self.cfg['t_min']
                        #for row_idx, row in df.iterrows():

                            # if payload['t_start'] > next_publish:
                            #     next_publish = payload['t_start'] + self.cfg['t_step']
                    self.idx += 1
                    self.row = 0
                    if self.event.is_set():
                        break
                if not self.event.is_set():
                    self.idx = 0
                    self.published = True
                    break
            print("Stopped streaming <" + self.streamtype + "> of table <" + self.table + ">")
            if self.published:
                print('Request fully published')
                reset_state(self.table, self.streamtype)
            else:
                self.save_state()
                print('Saved current state:', end='')
                print(states[self.table][self.streamtype])

    def publish(self, df):
        ts_last = self.cfg['t_min']
        ts_idx = len(self.cfg['time']) - 1
        t_start_data = -1
        for row_idx, row in df.iterrows():
            timestamp = row[ts_idx]
            if row_idx < self.row or timestamp < ts_last:
                continue
            if t_start_data == -1 and timestamp >= th.timeinfo['t_start']:
                t_start_data = timestamp
                t_start_real = time.perf_counter()
            if timestamp == ts_last or ts_last == self.cfg['t_min']:
                if self.table == 'job_events':
                    payload = self.get_event_payload(row, timestamp)
                elif self.table == 'task_usage':
                    payload = self.get_usage_payload(row)
                ts_last = timestamp
            else:
                elapsed_data = timestamp - t_start_data
                elapsed_real = int(time.perf_counter() - t_start_real) * 1000 * 1000
                wait = (elapsed_data - elapsed_real) / (1000.0 * 1000.0)
                if elapsed_data > elapsed_real:
                    print("Next ts would be in " + str(wait) + "seconds.")
                print(payload)
                publisher.publish(topic=self.cfg['topic'], payload=self.convert_payload(payload))
                time.sleep(0.05)
                ts_last = timestamp
                if self.table == 'job_events':
                    payload = self.get_event_payload(row, timestamp)
                elif self.table == 'task_usage':
                    payload = self.get_usage_payload(row)
            self.row += 1
            if self.event.is_set():
                break

    def load_df(self, filename):
        t = self.table
        cols = self.cfg['cols']
        f_path = os.path.join('./data/' + t, filename)
        print("Loading " + filename + " of table " + t + "...", end="")
        headers = fh.get_headers_by_cols(t, cols)
        dtypes = fh.get_coltypes_by_headers(t, headers)
        df = pd.read_csv(f_path, usecols=cols, compression='gzip', header=None, names=headers, sep=',',
                         error_bad_lines=False, dtype=dtypes)
        df = df.fillna(-1)
        print("Done!")
        return df

    def save_state(self):
        states[self.table][self.streamtype]['idx'] = self.idx
        states[self.table][self.streamtype]['row'] = self.row
        states[self.table][self.streamtype]['sets'] = self.sets

    def set_state(self):
        t = self.table
        s = self.streamtype
        if t in states.keys():
            if s in states[t].keys():
                self.idx = states[t][s]['idx']
                self.row = states[t][s]['row']
                self.sets = states[t][s]['sets']
            else:
                states[t][s] = {'idx': 0, 'row': 0, 'sets': init_sets(t, s)}
        else:
            states[t] = {s: {'idx': 0, 'row': 0, 'sets': init_sets(t, s)}}

    def get_event_payload(self, row, timestamp):
        payload = {}
        payload['time'] = timestamp
        update_sets(row['event_type'], row['job_ID'], self.sets)
        payload['data'] = self.cfg['func'](self.sets)
        return payload

    def get_usage_payload(self, row):
        payload = {}
        payload['time'] = row[0]
        payload['data'] = {'val': (row[2] * 10)}
        return payload

    def convert_payload(self, payload):
        res = payload
        res['table'] = self.table
        res['type'] = self.streamtype
        res['time'] = str(payload['time'])
        res = json.dumps(res)
        return res






# for idx, filename in enumerate(os.listdir('./data/' + self.table)):
#     filepath = os.path.join('./data/' + self.table, filename)
#     print("Loading new file from table " + self.table + "...", end="")
#     headers = fh.get_headers_by_cols(self.table, self.usecols)
#     dtypes = fh.get_coltypes_by_headers(self.table, headers)
#     df = pd.read_csv(filepath, usecols=self.usecols, compression='gzip', header=None, names=headers, sep=',',
#                      error_bad_lines=False, dtype=dtypes)
#     df = df.fillna(-1)
#     print("Done!")
#     stream_start = time.perf_counter()
#     for idx, row in df.iterrows():
#         stream_now = (time.perf_counter() - stream_start) * 1000 * 1000
#         topic = 'roman/clusterdata/' + self.table.replace('_', '')
#         payload = row.to_json()
#         client.publish(topic=topic, payload=payload)
#         # print('Published: %s to %s' % (payload, topic))


def publish_job_events():
    usecols = [0, 2, 3]
    table = 'job_events'
    for idx, filename in enumerate(os.listdir('./data/' + table)):
        filepath = os.path.join('./data/' + table, filename)
        print("Loading new file from table " + table + "...", end="")
        headers = fh.get_headers_by_cols(table, usecols)
        dtypes = fh.get_coltypes_by_headers(table, headers)
        df = pd.read_csv(filepath, usecols=usecols, compression='gzip', header=None, names=headers, sep=',',
                         error_bad_lines=False, dtype=dtypes)
        df = df.fillna(-1)
        print("Done!")
        pending = set({})
        running = set({})
        dead = set({})
        finish = set({})
        ts_now = -1
        for row_idx, row in df.iterrows():
            timestamp = row['time']
            event = row['event_type']
            job = row['job_ID']
            topic = 'roman/clusterdata/' + table.replace('_', '')
            if ts_now > 0 and ts_now != timestamp:
                payload = json.dumps({
                    'type': 'all_events',
                    'time': str(ts_now),
                    'running': len(running),
                    'pending': len(pending),
                    'dead': len(dead),
                    'finish': len(finish)
                })
                publisher.publish(topic=topic, payload=payload)
                print('Published: %s to %s' % (payload, topic))
                time.sleep(0.1)
            update_sets(event, job, running, pending, dead, finish)
            ts_now = timestamp


def publish_job_events_diff():
    usecols = [0, 2, 3]
    table = 'job_events'
    for idx, filename in enumerate(os.listdir('./data/' + table)):
        filepath = os.path.join('./data/' + table, filename)
        print("Loading new file from table " + table + "...", end="")
        headers = fh.get_headers_by_cols(table, usecols)
        dtypes = fh.get_coltypes_by_headers(table, headers)
        df = pd.read_csv(filepath, usecols=usecols, compression='gzip', header=None, names=headers, sep=',',
                         error_bad_lines=False, dtype=dtypes)
        df = df.fillna(-1)
        pending = set({})
        running = set({})
        dead = set({})
        finish = set({})
        counter = get_zerocounter()
        interval = 60 * 1000 * 1000
        next_publish = 0
        topic = 'roman/clusterdata/' + table.replace('_', '')
        for row_idx, row in df.iterrows():
            timestamp = row['time']
            event = row['event_type']
            job = row['job_ID']
            update_sets(event, job, running, pending, dead, finish)
            if timestamp > 0:
                count_diffs(event, job, running, pending, dead, counter)
                if next_publish == 0:
                    next_publish = timestamp + interval
            if timestamp > next_publish:
                payload = json.dumps({
                    'type': 'diffcounter',
                    'time': str(timestamp),
                    'scheduled': counter['scheduled'],
                    'submit': counter['submit'],
                    'resubmit': counter['resubmit'],
                    'deschedule_pending':counter['deschedule_pending'],
                    'deschedule_running': counter['deschedule_running'],
                })
                counter = get_zerocounter()
                next_publish += interval
                publisher.publish(topic=topic, payload=payload)
                print('Published: %s to %s' % (payload, topic))
                time.sleep(0.1)


def get_zerocounter():
    counter = {
        'scheduled': 0,
        'submit': 0,
        'resubmit': 0,
        'deschedule_pending': 0,
        'deschedule_running': 0
    }
    return counter

def count_diffs(event, job, running, pending, dead, counter):
    if event == 0:
        if job in dead:
            counter['resubmit'] += 1
        else:
            counter['submit'] += 1
    elif event == 1:
        counter['scheduled'] += 1
    elif event == 2 or event == 4:
        counter['deschedule_running'] += 1
    elif event in [3, 5, 6]:
        if job in running:
            counter['deschedule_running'] += 1
        elif job in pending:
            counter['deschedule_pending'] += 1


# def update_sets(event, job, running, pending, dead, finish):
#     if event == 0:
#         pending.update([job])
#         dead.difference_update([job])
#     elif event == 1:
#         running.update([job])
#         pending.difference_update([job])
#     elif event in [2, 3, 4, 5, 6]:
#         running.difference_update([job])
#         pending.difference_update([job])
#         if event == 4:
#             finish.update([job])
#         dead.update([job])

