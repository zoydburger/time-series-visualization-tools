from os import listdir
from os.path import isfile, join, abspath
import numpy as np
import pandas as pd

SCHEMA_PATH = abspath('./data/schema.csv')
DATA_ROOT = abspath('./data')


SCHEMA = {
    'patterns': {}
}

SCHEMA_MIN = {}

DTYPES = {
    "INTEGER": np.dtype(np.int64),
    "STRING_HASH": np.dtype(np.unicode_),
    "FLOAT": np.dtype(np.float32),
    "BOOLEAN": np.dtype(bool),
    "STRING_HASH_OR_INTEGER": np.dtype(np.unicode_)
}

"""""""""""""""[SCHEMA CREATION]"""""""""""""""""

schema_csv = pd.read_csv(SCHEMA_PATH, header=0, dtype=str).to_dict(orient="records")
table = ""
for row in schema_csv:
    name = row['file pattern'].split("/")[0]
    if name != table:
        table = str(name)
        SCHEMA[table] = {}
        SCHEMA_MIN[table] = []
    col_content = {'type': row['format'],
                   'dtype': DTYPES[row['format']],
                   'mandatory': row['mandatory']}
    col_name = row['content'].replace(" ", "_").replace('/', '')
    SCHEMA[table][col_name] = col_content
    SCHEMA_MIN[table].append(col_name)
    SCHEMA['patterns'][table] = row['file pattern']


"""""""""""""""[SCHEMA CREATION]"""""""""""""""""


# FUNCTIONS

def get_headers(tname):
    headers = list(SCHEMA[tname].keys())
    return headers


def get_headers_by_cols(tname, cols):
    headers = []
    for col in cols:
        headers.append(SCHEMA_MIN[tname][col])
    return headers


def get_coltypes_by_headers(tname, headers):
    types_min = {}
    for header in headers:
        types_min[header] = get_col_type(tname, header)
    return types_min


def get_file_pattern(tname):
    return SCHEMA['patterns'][tname]


def get_col_type(tname, col):
    return DTYPES[SCHEMA[tname][col]['type']]


def get_max_files(tname):
    path = DATA_ROOT + "\\" + tname + "\\"
    return [f for f in listdir(path) if isfile(join(path, f))]


def get_file_path(tname, index):
    #max_file_index = len(listdir(DATA_ROOT + "/" + tname + "/"))
    max_file_index = 500
    file_pattern = get_file_pattern(tname)
    file_path = file_pattern.replace('-?????-', '-' + str(index).zfill(5) + '-')
    file_path = file_path.replace('-?????.', '-' + str(max_file_index).zfill(5) + '.')
    return join(DATA_ROOT, file_path)


def table_df(tname, fname):
    path = join(DATA_ROOT, tname, fname)
    df = pd.read_csv(path, compression='gzip', header=None, names=get_headers(tname), sep=',',
                     error_bad_lines=False, dtype=str)
    return df


def table_reader(tname, fname, chunksize):
    path = join(DATA_ROOT, tname, fname)
    df = pd.read_csv(path, compression='gzip', header=None, names=get_headers(tname), sep=',',
                     error_bad_lines=False, dtype=str, chunksize=chunksize)
    return df