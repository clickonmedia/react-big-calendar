import PropTypes from 'prop-types'
import React from 'react'

import Week from './Week'
import TimeGridGantt from './TimeGridGantt'

function ganttRange(date, { localizer }) {
  let firstOfWeek = localizer.startOfWeek()
  let start = localizer.startOf(date, 'week', firstOfWeek)
  let end = localizer.add(start, 2, 'week')

  return localizer.range(start, end)
}

class Gantt extends React.Component {
  render() {
    /**
     * This allows us to default min, max, and scrollToTime
     * using our localizer. This is necessary until such time
     * as TimeGridGantt is converted to a functional component.
     */
    let {
      date,
      localizer,
      min = localizer.startOf(new Date(), 'day'),
      max = localizer.endOf(new Date(), 'day'),
      scrollToTime = localizer.startOf(new Date(), 'day'),
      ...props
    } = this.props
    let range = ganttRange(date, this.props)
    return (
      <TimeGridGantt
        {...props}
        range={range}
        eventOffset={15}
        localizer={localizer}
        min={min}
        max={max}
        scrollToTime={scrollToTime}
      />
    )
  }
}

Gantt.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  localizer: PropTypes.any,
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  scrollToTime: PropTypes.instanceOf(Date),
}

Gantt.defaultProps = TimeGridGantt.defaultProps

Gantt.range = ganttRange

Gantt.navigate = Week.navigate

Gantt.title = (date, { localizer }) => {
  let [start, ...rest] = ganttRange(date, { localizer })

  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
}

export default Gantt
