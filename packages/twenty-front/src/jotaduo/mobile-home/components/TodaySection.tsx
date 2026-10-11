import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { JOTADUO_APPOINTMENT_OBJECT_NAME_SINGULAR } from '~/jotaduo/constants/JotaduoAppointmentObjectNameSingular';
import { JOTADUO_REMINDER_OBJECT_NAME_SINGULAR } from '~/jotaduo/constants/JotaduoReminderObjectNameSingular';
import { MobileHomeRecordsSource } from '~/jotaduo/mobile-home/components/MobileHomeRecordsSource';
import { TodaySectionContent } from '~/jotaduo/mobile-home/components/TodaySectionContent';
import { TODAY_VISIBLE_ITEM_COUNT } from '~/jotaduo/mobile-home/constants/TodayVisibleItemCount';
import { useMobileHomeFilterContext } from '~/jotaduo/mobile-home/hooks/useMobileHomeFilterContext';
import { getTodayItems } from '~/jotaduo/mobile-home/utils/getTodayItems';
import { getTodayRecordFilters } from '~/jotaduo/mobile-home/utils/getTodayRecordFilters';

// What the day holds for the person: the JotaDuo app's appointments and
// reminders, when the workspace has the app, and Twenty's own tasks. Tasks
// left from other days only come as a figure, so a backlog does not bury
// the day.
export const TodaySection = () => {
  const filterContext = useMobileHomeFilterContext();

  if (!isDefined(filterContext)) {
    return null;
  }

  const todayRecordFilters = getTodayRecordFilters(filterContext);

  return (
    <MobileHomeRecordsSource
      objectNameSingular={JOTADUO_APPOINTMENT_OBJECT_NAME_SINGULAR}
      filter={todayRecordFilters.appointments}
      orderBy={[{ startsAt: 'AscNullsLast' }]}
      recordGqlFields={{ id: true, name: true, startsAt: true, service: true }}
      limit={TODAY_VISIBLE_ITEM_COUNT}
    >
      {(appointments, appointmentCount) => (
        <MobileHomeRecordsSource
          objectNameSingular={JOTADUO_REMINDER_OBJECT_NAME_SINGULAR}
          filter={todayRecordFilters.reminders}
          orderBy={[{ dispararEm: 'AscNullsLast' }]}
          recordGqlFields={{
            id: true,
            name: true,
            texto: true,
            pessoaNome: true,
            dispararEm: true,
          }}
          limit={TODAY_VISIBLE_ITEM_COUNT}
        >
          {(reminders, reminderCount) => (
            <MobileHomeRecordsSource
              objectNameSingular={CoreObjectNameSingular.Task}
              filter={todayRecordFilters.tasks}
              orderBy={[{ dueAt: 'AscNullsLast' }]}
              recordGqlFields={{
                id: true,
                title: true,
                dueAt: true,
                status: true,
              }}
              limit={TODAY_VISIBLE_ITEM_COUNT}
            >
              {(tasks, taskCount) => (
                // Only the figure is wanted here, so a single record is asked
                // for.
                <MobileHomeRecordsSource
                  objectNameSingular={CoreObjectNameSingular.Task}
                  filter={todayRecordFilters.overdueTasks}
                  recordGqlFields={{ id: true }}
                  limit={1}
                >
                  {(_overdueTasks, overdueTaskCount) => (
                    <TodaySectionContent
                      todayItems={getTodayItems({
                        appointments,
                        reminders,
                        tasks,
                      })}
                      // A task checked off stays on the list but out of the
                      // figure.
                      openItemCount={
                        appointmentCount +
                        reminderCount +
                        taskCount -
                        tasks.filter((task) => task.status === 'DONE').length
                      }
                      overdueTaskCount={overdueTaskCount}
                    />
                  )}
                </MobileHomeRecordsSource>
              )}
            </MobileHomeRecordsSource>
          )}
        </MobileHomeRecordsSource>
      )}
    </MobileHomeRecordsSource>
  );
};
