import {
  FLIP_SENSOR_CARD,
  LOAD_SENSOR,
  REMOVE_SENSOR,
  RESET_HISTORICAL_DATA,
  VIEW_MODE,
  UPDATE_SENSOR,
  RECEIVED_LIVE_DATA,
  LOADING_HISTORICAL_DATA,
  RECEIVED_HISTORICAL_DATA,
  RESET_LIVE_DATA,
  SAVE_SENSOR,
  CLOSE_MODAL,
  FILTER_SENSORS,
  UPDATE_START_DATE,
  UPDATE_END_DATE,
  RESET_HISTORICAL_DATES,
  UPDATE_HISTORICAL_LOCAITON,
  UPDATE_HISTORICAL_RESOLUTION,
  LOADING_SENSORS,
  RECEIVED_SENSORS
} from '../constants/actionTypes';
import * as Constants from '../constants/viewConstants';
import Immutable from 'immutable';
import moment from 'moment';

import * as SensorLocation from '../constants/sensorLocations';


const newSensor = Immutable.fromJS({
  id: 0,
  name: '',
  location: SensorLocation.BATHROOM_SINK,
  installDate: 'July 20, 2016',
  isFlipped: false
});

const initialState = Immutable.fromJS({
  sensors: [
    {
      id: 1,
      name: 'Kitchen Sink',
      location: SensorLocation.KITCHEN_SINK,
      installDate: 'June 27, 2016',
      isFlipped: false
    }, {
      id: 2,
      name: 'Master Bedroom Sink',
      location: SensorLocation.BATHROOM_SINK,
      installDate: 'May 05, 2016',
      isFlipped: false
    }
  ],
  editSensor: newSensor,
  editView: false,
  filter: [],
  isAddingSensor: false,
  historicalConsumption: 0,
  historicalData: [],
  historicalLocation: 'total',
  historicalResolution: Constants.DAILY,
  historicalStart: moment().subtract(1, 'month'),
  historicalEnd: moment(),
  liveData: {
    time: [],
    flow_ml: [],
    zeros: [],
    total_flow_ml: 0
  },
  timeStamp: null,
  viewMode: Constants.CARD,
  loading: false,
  retrievedSensors: false
});

export default function tipReducer(state = initialState, action) {
  switch (action.type) {
    case LOADING_SENSORS:
      return state.set('loading', true);

    case RECEIVED_SENSORS:
      if (action.data.location) {
        return state.update('sensors', (list) => list.push(Immutable.fromJS({
          id: 3,
          name: 'Sensor',
          location: action.data.location,
          installDate: 'July 20, 2016',
          isFlipped: false
        }))).set('loading', false).set('retrievedSensors', true);
      }
      return state;

    case SAVE_SENSOR: {
      if (state.getIn(['editSensor', 'id']) === 0) {
        return state.setIn(['sensors', state.get('sensors').size],
                            state.get('editSensor')
                                 .set('id', state.get('sensors').size + 1)
                                 .set('isFlipped', false))
                    .set('editView', false);
      }
      const index = state.get('sensors').findIndex((item) => item.get('id') === state.getIn(['editSensor', 'id']));
      return state.setIn(['sensors', index], state.get('editSensor').set('isFlipped', false)).set('editView', false);
    }
    case REMOVE_SENSOR:
      return state.update('sensors', (list) => list.delete(list.findIndex((item) => item.get('id') === action.id))).set('retrievedSensors', action.retrievedSensor);

    case VIEW_MODE:
      return state.set('viewMode', action.viewMode);

    case FLIP_SENSOR_CARD:
      return state.setIn(['sensors', action.index, 'isFlipped'], action.status);

    case LOAD_SENSOR:
      if (action.index === 0) {
        return state.set('editSensor', newSensor).set('editView', true);
      }
      return state.set('editSensor', state.getIn(['sensors', state.get('sensors').findIndex((item) => item.get('id') === action.index)])).set('editView', true);

    case UPDATE_SENSOR:
      return state.setIn(['editSensor', action.key], action.value);

    case CLOSE_MODAL:
      return state.set('editView', false);

    case FILTER_SENSORS:
      return state.set('filter', Immutable.fromJS(!action.value ? [] : action.value.split(',')));

    case RECEIVED_LIVE_DATA:
      if (state.getIn(['liveData', 'time']).size < 30) {
        return state.updateIn(['liveData', 'time'], (data) => data.push(action.timestamp.toString()))
                    .updateIn(['liveData', 'flow_ml'], (data) => data.push(action.flow_ml.toString()))
                    .updateIn(['liveData', 'zeros'], (data) => data.push('0'))
                    .updateIn(['liveData', 'total_flow_ml'], (value) => value + action.flow_ml);
      }
      return state.updateIn(['liveData', 'time'], (data) => data.shift().push(action.timestamp.toString()))
                  .updateIn(['liveData', 'flow_ml'], (data) => data.shift().push(action.flow_ml.toString()))
                  .updateIn(['liveData', 'zeros'], (data) => data.push('0'))
                  .updateIn(['liveData', 'total_flow_ml'], (value) => value + action.flow_ml);

    case LOADING_HISTORICAL_DATA:
      return state.set('loading', action.status);

    case RECEIVED_HISTORICAL_DATA:
      return state.set('loading', false)
                  .set('historicalData', Immutable.fromJS(action.data.data))
                  .set('historicalConsumption', action.data.total_consumed);

    case RESET_LIVE_DATA:
      return state.set('liveData', Immutable.fromJS({
        time: [],
        flow_ml: [],
        zeros: [],
        total_flow_ml: 0
      }));

    case RESET_HISTORICAL_DATA:
      return state.set('historicalData', Immutable.fromJS([]))
                  .set('historicalResolution', Constants.DAILY)
                  .set('historicalStart', moment().subtract(1, 'month'))
                  .set('historicalEnd', moment());

    case UPDATE_START_DATE:
      return state.set('historicalStart', action.date);

    case UPDATE_END_DATE:
      return state.set('historicalEnd', action.date);

    case UPDATE_HISTORICAL_LOCAITON:
      return state.set('historicalLocation', action.location);

    case UPDATE_HISTORICAL_RESOLUTION:
      if (action.resolution === Constants.HOURLY) {
        return state.set('historicalResolution', action.resolution)
                    .set('historicalEnd', moment(state.get('historicalStart')).add(7, 'days'));
      }
      return state.set('historicalResolution', action.resolution);

    case RESET_HISTORICAL_DATES:
      return state.set('historicalStart', moment().subtract(1, 'month'))
                  .set('historicalEnd', moment())
                  .set('historicalLocation', 'total')
                  .set('historicalResolution', Constants.DAILY);

    default:
      return state;
  }
}
