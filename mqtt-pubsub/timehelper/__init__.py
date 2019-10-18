from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import pytz

timeinfo = {
    "us": 1,
    "ms": 1000,
    "s": 1000 * 1000,
    "min": 60 * 1000 * 1000,
    "h": 60 * 60 * 1000 * 1000,
    "d": 24 * 60 * 60 * 1000 * 1000,
    "w": 7 * 24 * 60 * 60 * 1000 * 1000,
    "t_min": 0,
    "t_max": np.iinfo(np.int64).max,
    "t_start": 600 * 1000 * 1000,
    "timezone": pytz.timezone("US/Eastern"),
    "date_start": datetime(2011, 5, 1, 19, 0, 0, 0)
}


def offset_dt(ts_offset, dt=timeinfo["date_start"]):
    if(type(ts_offset) != int):
        offset = ts_offset.astype(np.float64)
    else:
        offset = ts_offset
    delta = timedelta(microseconds=offset)


    return dt + delta


def format_dt(dt):
    fmt = '%Y-%m-%d %H:%M:%S:%f %Z%z'
    loc_dt = timeinfo["timezone"].localize(dt)
    return loc_dt.strftime(fmt)


def format_timestamp(timestamp):
    dt = offset_dt(timestamp)
    return format_dt(dt)


def dt_to_timestamp(dt):
    dt_in_us = np.dtype(np.int64).type((dt - timeinfo["date_start"]).total_seconds() * timeinfo['s'])
    return dt_in_us


def to_dt_index(df_timestamps):
    timestamps = np.asarray(df_timestamps, dtype=str)
    dt_arr = []
    for ts in timestamps:
        dt_arr.append(offset_dt(ts))
    return pd.DatetimeIndex(dt_arr)
