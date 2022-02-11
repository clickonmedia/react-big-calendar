import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import scrollbarSize from 'dom-helpers/scrollbarSize'

import DateContentRow from './DateContentRow'
import Header from './Header'
import ResourceHeader from './ResourceHeader'
import { notify } from './utils/helpers'

class TimeGridHeader extends React.Component {
  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCells(range) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = Header },
    } = this.props

    const today = getNow()

    return range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')

      const { className, style } = dayProp(date)

      let header = (
        <HeaderComponent date={date} label={label} localizer={localizer} />
      )

      const isToday = localizer.isSameDate(date, today)
      const isWeekend = ['Sat', 'Sun'].includes(localizer.format(date, 'weekdayFormat'));

      return (
        <div
          key={i}
          style={style}
          className={clsx(
            'rbc-header',
            className,
            isToday && 'rbc-today',
            isWeekend && 'rbc-weekend',
          )}
        >
          {drilldownView ? (
            <a
              href="#"
              onClick={e => this.handleHeaderClick(date, drilldownView, e)}
            >
              {header}
            </a>
          ) : (
            <span>{header}</span>
          )}
          { isToday &&
            <div className="rbc-day-indicator"></div>
          }
        </div>
      )
    })
  }

  renderGanttRows(resource, id) {
    let {
      width,
      rtl,
      resources,
      range,
      events,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      scrollRef,
      localizer,
      isOverflowing,
      components: {
        timeGutterHeader: TimeGutterHeader,
        resourceHeader: ResourceHeaderComponent = ResourceHeader,
      },
      resizable,
      categories,
    } = this.props

    const categoryEvents = events.filter(item => item.category_id === 1)
    const groupedEvents = resources.groupEvents(categoryEvents)

    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
    }

    return (
      <Fragment>
        { (categories || []).map( (cat, idx) => {
            const categoryEvents = events.filter(item => item.category_id === cat.id)
            const groupedEvents = resources.groupEvents(categoryEvents)

            return (
                <DateContentRow
                    key={idx}
                    isAllDay
                    rtl={rtl}
                    getNow={getNow}
                    minRows={2}
                    range={range}
                    events={groupedEvents.get(id) || []}
                    resourceId={resource && id}
                    className="rbc-allday-cell"
                    selectable={selectable}
                    selected={this.props.selected}
                    components={components}
                    accessors={accessors}
                    getters={getters}
                    localizer={localizer}
                    onSelect={this.props.onSelectEvent}
                    onDoubleClick={this.props.onDoubleClickEvent}
                    onKeyPress={this.props.onKeyPressEvent}
                    onSelectSlot={this.props.onSelectSlot}
                    longPressThreshold={this.props.longPressThreshold}
                    resizable={resizable}
                />
            )
        })}
      </Fragment>
    )
  }

  render() {
    let {
      width,
      rtl,
      resources,
      range,
      events,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      scrollRef,
      localizer,
      isOverflowing,
      components: {
        timeGutterHeader: TimeGutterHeader,
        resourceHeader: ResourceHeaderComponent = ResourceHeader,
      },
      resizable,
      categories,
    } = this.props

    let style = {}

    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
    }

    console.log('TimeGridHeaderGantt', this.props)

    return (
      <div
        style={style}
        ref={scrollRef}
        className={clsx('rbc-time-header', isOverflowing && 'rbc-overflowing')}
      >
        <div
          className="rbc-label rbc-time-header-gutter"
          style={{ width, minWidth: width, maxWidth: width }}
        >
          {TimeGutterHeader && <TimeGutterHeader />}
        </div>

        {resources.map(([id, resource], idx) => (
          <div className="rbc-time-header-content" key={id || idx}>
            {resource && (
              <div className="rbc-row rbc-row-resource" key={`resource_${idx}`}>
                <div className="rbc-header">
                  <ResourceHeaderComponent
                    index={idx}
                    label={accessors.resourceTitle(resource)}
                    resource={resource}
                  />
                </div>
              </div>
            )}
            <div
              className={`rbc-row rbc-time-header-cell${
                range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
              }`}
            >
              {this.renderHeaderCells(range)}
            </div>
            { this.renderGanttRows(resource, id) }
          </div>
        ))}
      </div>
    )
  }
}

TimeGridHeader.propTypes = {
  range: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  resources: PropTypes.object,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,

  rtl: PropTypes.bool,
  resizable: PropTypes.bool,
  width: PropTypes.number,

  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any,
}

export default TimeGridHeader
