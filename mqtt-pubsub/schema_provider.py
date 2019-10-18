import filehelper as fh
import json
from flask_cors import CORS
from flask import Flask
from gevent.pywsgi import WSGIServer


app = Flask(__name__)

# CORS enabled so react frontend can pull data from python backend
CORS(app)


@app.route('/schema')
def get_schema():
    return json.dumps(fh.SCHEMA_MIN)



# Using WSGI server to allow self contained server
print('\n########################################################')
print("#########  Server listening on HTTP port 5000  #########")
print('########################################################\n')

http_server = WSGIServer(('', 5000), app)
http_server.serve_forever()
