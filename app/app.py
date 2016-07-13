from flask import Flask, render_template
from flask_restful import Resource, Api, reqparse
import datetime
import os
import pymongo

WEBSOCKET = '127.0.0.1:8888'

## Override default template directory
template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            'js', 'dist')

## Specify Static folder location
## Hardcoded path for now since its just going to be an extension
## of this folder
static = "/js/dist"

app = Flask(__name__,
            template_folder=template_dir,
            static_url_path=static)
api = Api(app)

# Initialize db connection
#db = pymongo.MongoClient('localhost', 27017)['waterbud']

# Homepage
@app.route('/')
def index():
    return render_template('index.html')

## API Endpoints
class WSLocation(Resource):
    def get(self):
        return {'ws_location': WEBSOCKET}

class AddSensor(Resource):
    add_sensor_parser = reqparse.RequestParser()
    add_sensor_parser.add_argument('location')
    valid_locations = ["bathroom sink", "kitchen sink", "shower", "garden"]
        
    def get(self):
        # HACK Anshuman July 12, 2016
        # Not sure why but I cant seem to update a variable in post
        # and then get the new variable value in get
        # we are going to do a bs hack and store the value in db
        # (capped collection of object size 1)
        # since for MVP we are not showing auto-discovery, have this
        # return a location, if not return null
        try:
            val = db['add_sensor'].find_one({}).get('location', None)
        except:
            val = 'testing'
 
        if not val:
            val = ''

        return val, 200

    def post(self):
        # add logic to add sensor --> Mocked for MVP
        args = self.add_sensor_parser.parse_args()
        location = args['location']
	return location, 201

    
    def delete(self):
        # we can't delete from a capped collection in mongo
        # we are just going to set the location in the current document to None
        try:
            data = db['add_sensor'].find_one({})
            location = data.get('location', None)
        except:
            location = Testing
	return location, 200

class SensorData(Resource):                                                                           
    def get(self, location, start, end):
	return {'location': location,
		'start': start,
		'end': end}

# Add all API endpoints after declaring them
api.add_resource(AddSensor, '/add_sensor')
api.add_resource(SensorData, '/data/<location>/<start>/<end>')
api.add_resource(WSLocation, '/ws')

if __name__ == '__main__':
    app.run()
