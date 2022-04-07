import PropTypes from 'prop-types'
import clsx from 'clsx'
import React, { Component } from 'react'
import memoize from 'memoize-one'

import DayColumn from './DayColumn'
import TimeGridHeaderGantt from './TimeGridHeaderGantt'
import { notify } from './utils/helpers'
import { inRange, sortEvents } from './utils/eventLevels'
import Resources from './utils/Resources'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'

export default class TimeGrid extends Component {
  constructor(props) {
    super(props)

    this.state = { gutterWidth: undefined, isOverflowing: null }

    this.scrollRef = React.createRef()
    this._scrollRatio = null
  }

  UNSAFE_componentWillMount() {
    this.calculateScroll()
  }

  handleScroll = e => {
    if (this.scrollRef.current) {
      this.scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { range, scrollToTime, localizer } = this.props
    // When paginating, reset scroll
    if (
      localizer.neq(nextProps.range[0], range[0], 'minutes') ||
      localizer.neq(nextProps.scrollToTime, scrollToTime, 'minutes')
    ) {
      this.calculateScroll(nextProps)
    }
  }

  handleSelectAlldayEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    this.clearSelection()
    notify(this.props.onSelectEvent, args)
  }

  handleSelectAllDaySlot = (slots, slotInfo) => {
    const { onSelectSlot } = this.props

    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(onSelectSlot, {
      slots,
      start,
      end,
      action: slotInfo.action,
      resourceId: slotInfo.resourceId,
    })
  }

  renderEvents(range, events, backgroundEvents, now) {
    let {
      min,
      max,
      components,
      accessors,
      localizer,
      dayLayoutAlgorithm,
    } = this.props

    const resources = this.memoizedResources(this.props.resources, accessors)
    const groupedEvents = resources.groupEvents(events)
    const groupedBackgroundEvents = resources.groupEvents(backgroundEvents)

    return resources.map(([id, resource], i) =>
      range.map((date, jj) => {
        let daysEvents = (groupedEvents.get(id) || []).filter(event =>
          localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        )

        let daysBackgroundEvents = (
          groupedBackgroundEvents.get(id) || []
        ).filter(event =>
          localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        )

        return (
          <DayColumn
            {...this.props}
            localizer={localizer}
            min={localizer.merge(date, min)}
            max={localizer.merge(date, max)}
            resource={resource && id}
            components={components}
            isNow={localizer.isSameDate(date, now)}
            key={i + '-' + jj}
            date={date}
            events={daysEvents}
            backgroundEvents={daysBackgroundEvents}
            dayLayoutAlgorithm={dayLayoutAlgorithm}
          />
        )
      })
    )
  }

  render() {
    let {
      events,
      backgroundEvents,
      range,
      width,
      rtl,
      selected,
      getNow,
      resources,
      components,
      accessors,
      getters,
      localizer,
      longPressThreshold,
      resizable,
      categories,
    } = this.props

    width = width || this.state.gutterWidth

    let start = range[0];
    let end = range[range.length - 1];

    this.slots = range.length

    let allDayEvents = [];
    let rangeBackgroundEvents = [];

    events.forEach(event => {
      if (inRange(event, start, end, accessors, localizer)) {
        allDayEvents.push(event)
      }
    })

    backgroundEvents.forEach(event => {
      if (inRange(event, start, end, accessors, localizer)) {
        rangeBackgroundEvents.push(event)
      }
    })

    allDayEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))

    return (
      <div
        className={clsx(
          'rbc-time-view',
          resources && 'rbc-time-view-resources'
        )}
      >
        <TimeGridHeaderGantt
          range={range}
          events={allDayEvents}
          width={width}
          rtl={rtl}
          getNow={getNow}
          localizer={localizer}
          selected={selected}
          resources={this.memoizedResources(resources, accessors)}
          selectable={this.props.selectable}
          accessors={accessors}
          getters={getters}
          components={components}
          scrollRef={this.scrollRef}
          isOverflowing={this.state.isOverflowing}
          longPressThreshold={longPressThreshold}
          onSelectSlot={this.handleSelectAllDaySlot}
          onSelectEvent={this.handleSelectAlldayEvent}
          onDoubleClickEvent={this.props.onDoubleClickEvent}
          onKeyPressEvent={this.props.onKeyPressEvent}
          onDrillDown={this.props.onDrillDown}
          getDrilldownView={this.props.getDrilldownView}
          resizable={resizable}
          categories={categories}
        />
      </div>
    )
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }

  calculateScroll(props = this.props) {
    const { min, max, scrollToTime, localizer } = props

    const diffMillis = scrollToTime - localizer.startOf(scrollToTime, 'day')
    const totalMillis = localizer.diff(min, max, 'milliseconds')

    this._scrollRatio = diffMillis / totalMillis
  }

  memoizedResources = memoize((resources, accessors) =>
    Resources(resources, accessors)
  )
}

TimeGrid.propTypes = {
  events: PropTypes.array.isRequired,
  backgroundEvents: PropTypes.array.isRequired,
  resources: PropTypes.array,

  step: PropTypes.number,
  timeslots: PropTypes.number,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date).isRequired,
  showMultiDayTimes: PropTypes.bool,

  rtl: PropTypes.bool,
  resizable: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,

  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
}

TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
}
