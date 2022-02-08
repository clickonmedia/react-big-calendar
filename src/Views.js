import { views } from './utils/constants'
import Month from './Month'
import Day from './Day'
import Week from './Week'
import TwoWeek from './TwoWeek'
import WorkWeek from './WorkWeek'
import Agenda from './Agenda'
import Gantt from './Gantt'

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.TWO_WEEK]: TwoWeek,  
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
  [views.GANTT]: Gantt,
}

export default VIEWS
