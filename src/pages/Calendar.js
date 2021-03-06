import React from 'react';
import { connect } from 'react-redux';
import YearView from '../components/Year';
import data from '../data/years.json';
import { CALENDAR_VIEW_TYPE } from '../store/state';
import domex from '../store';
import calendar from '../data/calendar';
import Month from '../components/month';
import NepaliDate from '../core/NepaliDate';
import SimpleDrawer from '../components/drawer';

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      day: null,
    };
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
  }
  handleUpdateAdMonths() {
    return (adYears, adMonths) => {
      domex.resource.post('/update_gregorian_months_local_months', {
        data: {
          years: Array.from(adYears),
          months: Array.from(adMonths),
        },
      });
    };
  }
  handleDrawerClose() {
    this.setState({
      day: null,
    });
    domex.resource.post('/drawer', {
      data: {
        status: false,
      },
    });
  }
  handleDayClick(monthIndex) {
    return (day) => () => {
      if (!day.isDay) return;
      this.setState({
        day,
      });
      domex.resource.post('/drawer', {
        data: {
          status: true,
        },
      });
    };
  }
  renderCalendarView() {
    const view = this.props.app.calendarView;
    const { cursor, yearEvents: events } = this.props.app;
    const monthIndex = cursor.month - 1;
    const value = data[cursor.year];
    switch (view) {
      case CALENDAR_VIEW_TYPE.YEAR.value:
        return (
          <YearView
            flipAnimation={this.props.app.flipAnimation}
            today={this.props.app.today}
            key={cursor.year}
            value={value}
            year={cursor.year}
            cursor={cursor}
          />
        );
      case CALENDAR_VIEW_TYPE.MONTH.value:
        return (
          monthIndex > -1 && (
            <Month
              handleDayClick={this.handleDayClick(monthIndex)}
              events={events[monthIndex]}
              updateAdMonths={this.handleUpdateAdMonths()}
              flipAnimation={this.props.app.flipAnimation}
              today={this.props.app.today}
              cursor={cursor}
              key={`${cursor.year}/${cursor.month}`}
              singleView
              index={monthIndex}
              name={calendar.month.np.long[monthIndex]}
              weekStart={value[monthIndex][0]}
              totalDays={value[monthIndex][1]}
            />
          )
        );
      default:
        break;
    }
  }

  render() {
    return (
      <div ref={this.monthViewRef}>
        {this.renderCalendarView()}
        {this.state.day && (
          <SimpleDrawer
            day={this.state.day}
            cursor={this.props.app.cursor}
            today={this.props.app.today}
            onClose={this.handleDrawerClose}
            visible={this.props.app.isDrawerOpen}
          />
        )}
      </div>
    );
  }

  componentDidMount() {
    const { year, month, day, view } = this.props.match.params;
    const np = NepaliDate.today();
    domex.resource.post('/today', {
      data: {
        year: np.nepaliYear,
        month: np.nepaliMonth,
        day: np.nepaliDay,
      },
    });
    domex.resource.post('/change_cursor', {
      data: {
        date: {
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
        },
      },
    });
    domex.resource.post('/change_calendar_view', {
      data: {
        view,
      },
    });
  }
}
const mapStateToProps = (state) => ({
  app: state.app,
});
export default connect(mapStateToProps)(Calendar);
