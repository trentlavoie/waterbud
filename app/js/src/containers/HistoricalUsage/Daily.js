import React, {PropTypes} from 'react';
import Highmaps from 'highcharts/modules/map';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import moment from 'moment';

import Chart from '../../components/Chart';
import SpecificLocation from '../../components/RoomSelect/SpecificLocation';

import * as actions from '../../actions/sensorsActions';
import * as miscActions from '../../actions/miscActions';
import DatePicker from 'react-datepicker';

class HistoricalDailyUsage extends React.Component {
  constructor(props) {
    super(props);
    this.handleStartDate = this.handleStartDate.bind(this);
    this.handleEndDate = this.handleEndDate.bind(this);
    this.retrieveDailyHistoricalData = this.retrieveDailyHistoricalData.bind(this);
    this.handleHistoricalLocation = this.handleHistoricalLocation.bind(this);
  }

  componentWillMount() {
    this.props.actions.fetchDailyHistoricalData('total',
                                                this.formatDate(moment().subtract(1, 'month')),
                                                this.formatDate(moment()));
  }

  componentWillUnmount() {
    this.props.actions.resetHistoricalDates();
    this.props.actions.retrieveNotifications();
  }

  formatDate(date) {
    return date.format("YYYY-MM-DD");
  }

  retrieveDailyHistoricalData() {
    this.props.actions.fetchDailyHistoricalData(this.props.historicalLocation,
                                                  this.formatDate(this.props.historicalStart),
                                                  this.formatDate(this.props.historicalEnd));
  }


  handleStartDate(date) {
    this.props.actions.handleStartDate(date);
  }

  handleEndDate(date) {
    this.props.actions.handleEndDate(date);
  }

  handleHistoricalLocation(location) {
    this.props.actions.updateHistoricalLocation(location);
  }

  render() {
    if(this.props.historicalData.size === 0) {
      if (this.props.loading) {
        return <div>LOADING DATA!!!</div>;
      }
      return <div>NO DATA!</div>;
    }
    const options = {
      rangeSelector: {
        selected: 5
      },
      navigator : {
        series : {
          data : this.props.historicalData.toJS()
        }
      },
      title: {
        text: 'Water Consumption'
      },
      tooltip: {
        style: {
          width: '200px'
        },
        valueDecimals: 4,
        shared: true
      },
      yAxis: {
        title: {
          text: 'Water Consumed (L)'
        }
      },
      series: [{
        name: 'Water Consumed (L)',
        data: this.props.historicalData.toJS(),
        id: 'dataseries'
      }]
    };
    console.log('historicalData', this.props.historicalData.toJS());
    return (
      <div>
        <div>
          <SpecificLocation
            value={this.props.historicalLocation}
            onChange={this.handleHistoricalLocation}
          />
          <DatePicker
            selected={this.props.historicalStart}
            onChange={this.handleStartDate}
          />
          To
          <DatePicker
            selected={this.props.historicalEnd}
            onChange={this.handleEndDate}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.retrieveDailyHistoricalData}
          >
            Go
          </button>
        </div>
        <Chart
          container="stockChart"
          type="stockChart"
          options={options}
          modules={[Highmaps]}
        />
      </div>
    );
  }
}

HistoricalDailyUsage.propTypes = {
  actions: PropTypes.object,
  historicalData: PropTypes.object,
  loading: PropTypes.bool
};

function mapStateToProps(state) {
  return {
    historicalData: state.sensors.get('historicalData'),
    historicalLocation: state.sensors.get('historicalLocation'),
    historicalStart: state.sensors.get('historicalStart'),
    historicalEnd: state.sensors.get('historicalEnd'),
    loading: state.sensors.get('loading')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Object.assign({}, actions, miscActions), dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoricalDailyUsage);
