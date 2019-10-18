import numpy as np

topic_prefix = 'roman/clusterdata/'


def accumulate(sets):
    data = {}
    for key in sets.keys():
        data[key] = len(sets[key])
    return data


def get_empty_types():
    res = {}
    for table in cfg_streams.keys():
        res[table] = {}
        for cfg in cfg_streams[table].keys():
            res[table][cfg] = {}
    return res


cfg_streams = {
    'job_events': {
        'accumulate': {
            'time': [0],
            'topic': topic_prefix + 'jobs' + '/accumulate',
            'cols': [0, 2, 3],
            'sets': ['pending', 'running', 'dead'],
            'counter': [],
            't_step': 1000 * 1000,
            't_min': 0,
            'func': accumulate
        },
        'difference': {
            'time': [0],
            'topic': topic_prefix + 'jobs' + '/difference',
            'cols': [0, 2, 3],
            'sets': ['pending, running', 'dead'],
            'counter': [],
            't_step': 60 * 1000 * 1000,
            't_min': 1
        },
    },
    'task_usage': {
        'forecast': {
            'time': [0],
            'topic': topic_prefix + 'usage' + '/forecast',
            'cols': [0, 1, 19],
            't_step': 1000 * 1000,
            't_min': 1,
            'sets': []
        }
    }
}


def fake_forecast():
    milliday = 100000
    values = np.random.rand(1, milliday)[0]
    timestamps = np.array(range(milliday))
    forecasts = []
    for val in values:
        rnd_up = np.random.rand()
        rnd_down = np.random.rand()
        val += val * (rnd_up/10.0)
        val -= val * (rnd_down/10.0)
        forecasts.append(val)
    return {
        'time': list(timestamps),
        'values': list(values),
        'forecasts': list(forecasts)
    }
