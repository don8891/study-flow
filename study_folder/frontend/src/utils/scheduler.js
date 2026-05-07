import { format, addDays } from "date-fns";

/**
 * Generates a list of study and break tasks based on topics and time constraints.
 * @param {Array} topics - The structured topics/subtopics from the syllabus.
 * @param {string} examDate - ISO string of the target exam date.
 * @param {number} studyHours - Daily study hour limit (1-12).
 * @param {string} startTimeStr - "HH:MM" format string for start time.
 * @returns {Array} tasks - The flattened list of tasks with dates and times.
 */
export function generateTasks(topics, examDate, studyHours, startTimeStr) {
  const tasks = [];
  const today = new Date();
  const maxMinsPerDay = studyHours * 60;
  
  // Time tracking for real-time schedule
  let startHour = 9;
  let startMinute = 0;
  if (startTimeStr && startTimeStr.includes(":")) {
    const parts = startTimeStr.split(":");
    startHour = parseInt(parts[0], 10);
    startMinute = parseInt(parts[1], 10);
  }

  let currentStudyDate = new Date(today);
  let currentTimePointer = new Date(currentStudyDate);
  currentTimePointer.setHours(startHour, startMinute, 0, 0);
  
  let minsUsedToday = 0;
  let taskCounter = 0;

  topics.forEach((mainItem, topicIndex) => {
    const itemsToSchedule = mainItem.subtopics && mainItem.subtopics.length > 0 
      ? mainItem.subtopics 
      : [mainItem.topic];

    itemsToSchedule.forEach((subtopic, subIndex) => {
      // If we exceed daily limit, move to next day
      if (minsUsedToday + 30 > maxMinsPerDay) { // 25 min session + 5 min break buffer
        currentStudyDate = addDays(currentStudyDate, 1);
        currentTimePointer = new Date(currentStudyDate);
        currentTimePointer.setHours(startHour, startMinute, 0, 0);
        minsUsedToday = 0;
        taskCounter = 0; // Reset counter for long break tracking
      }

      const dateStr = format(currentStudyDate, "yyyy-MM-dd");
      taskCounter++;
      
      // Focus Session
      const focusStart = format(currentTimePointer, "hh:mm a");
      currentTimePointer.setMinutes(currentTimePointer.getMinutes() + 25);
      const focusEnd = format(currentTimePointer, "hh:mm a");

      tasks.push({
        id: `${dateStr}-${focusStart}-${subtopic.replace(/\s+/g, '-').toLowerCase()}`,
        date: dateStr,
        topic: subIndex === 0 && mainItem.subtopics && mainItem.subtopics.length > 0 
          ? `${mainItem.topic}: ${subtopic}` 
          : subtopic,
        duration: "25",
        completed: false,
        type: "focus",
        startTime: focusStart,
        endTime: focusEnd,
        preference: startTimeStr // Keeping the variable name in object for compatibility, but it holds time now
      });

      minsUsedToday += 25;

      // Break
      const isLongBreak = taskCounter % 4 === 0;
      const breakDuration = isLongBreak ? 20 : 5;
      
      const breakStart = format(currentTimePointer, "hh:mm a");
      currentTimePointer.setMinutes(currentTimePointer.getMinutes() + breakDuration);
      const breakEnd = format(currentTimePointer, "hh:mm a");

      tasks.push({
        id: `${dateStr}-${breakStart}-break`,
        date: dateStr,
        topic: isLongBreak ? "Long Break 🧘" : "Short Break ☕",
        duration: breakDuration.toString(),
        completed: false,
        type: "break",
        startTime: breakStart,
        endTime: breakEnd,
        preference: startTimeStr
      });

      minsUsedToday += breakDuration;
    });
  });

  return tasks;
}

/**
 * Reschedules all incomplete future tasks starting from today.
 * Completed tasks stay untouched. Incomplete past tasks are moved forward.
 */
export function rescheduleMissedTasks(tasks, studyHours, startTimeStr) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Separate completed tasks from incomplete ones
  const completedTasks = tasks.filter(t => t.completed);
  const incompleteTasks = tasks.filter(t => !t.completed);

  // Only reschedule tasks that are in the past (missed) or today
  const missedTasks = incompleteTasks.filter(t => t.date < todayStr);
  const futureTasks = incompleteTasks.filter(t => t.date >= todayStr);

  if (missedTasks.length === 0) {
    return tasks; // Nothing to reschedule
  }

  // Combine missed + future incomplete tasks to redistribute
  const tasksToReschedule = [...missedTasks, ...futureTasks];

  // Separate focus sessions and breaks (we only reschedule focus sessions;
  // breaks will be re-injected automatically)
  const focusTasksOnly = tasksToReschedule.filter(t => t.type === "focus");

  // Build synthetic topic list from existing focus tasks
  const syntheticTopics = focusTasksOnly.map(t => ({
    topic: t.topic,
    subtopics: []
  }));

  // Re-generate tasks starting from today
  const rescheduled = generateTasksFromDate(syntheticTopics, today, studyHours, startTimeStr);

  return [...completedTasks, ...rescheduled];
}


/**
 * Same as generateTasks but accepts a Date object as start instead of examDate.
 */
export function generateTasksFromDate(topics, startDate, studyHours, startTimeStr) {
  const tasks = [];
  const maxMinsPerDay = studyHours * 60;

  let startHour = 9;
  let startMinute = 0;
  if (startTimeStr && startTimeStr.includes(":")) {
    const parts = startTimeStr.split(":");
    startHour = parseInt(parts[0], 10);
    startMinute = parseInt(parts[1], 10);
  }

  let currentStudyDate = new Date(startDate);
  let currentTimePointer = new Date(currentStudyDate);
  currentTimePointer.setHours(startHour, startMinute, 0, 0);

  let minsUsedToday = 0;
  let taskCounter = 0;

  topics.forEach((mainItem) => {
    const itemsToSchedule =
      mainItem.subtopics && mainItem.subtopics.length > 0
        ? mainItem.subtopics
        : [mainItem.topic];

    itemsToSchedule.forEach((subtopic, subIndex) => {
      if (minsUsedToday + 30 > maxMinsPerDay) {
        currentStudyDate = addDays(currentStudyDate, 1);
        currentTimePointer = new Date(currentStudyDate);
        currentTimePointer.setHours(startHour, startMinute, 0, 0);
        minsUsedToday = 0;
        taskCounter = 0;
      }

      const dateStr = format(currentStudyDate, "yyyy-MM-dd");
      taskCounter++;

      const focusStart = format(currentTimePointer, "hh:mm a");
      currentTimePointer.setMinutes(currentTimePointer.getMinutes() + 25);
      const focusEnd = format(currentTimePointer, "hh:mm a");

      tasks.push({
        id: `${dateStr}-${focusStart}-${subtopic.replace(/\s+/g, '-').toLowerCase()}`,
        date: dateStr,
        topic:
          subIndex === 0 && mainItem.subtopics && mainItem.subtopics.length > 0
            ? `${mainItem.topic}: ${subtopic}`
            : subtopic,
        duration: "25",
        completed: false,
        type: "focus",
        startTime: focusStart,
        endTime: focusEnd,
        preference: startTimeStr,
      });

      minsUsedToday += 25;

      const isLongBreak = taskCounter % 4 === 0;
      const breakDuration = isLongBreak ? 20 : 5;

      const breakStart = format(currentTimePointer, "hh:mm a");
      currentTimePointer.setMinutes(currentTimePointer.getMinutes() + breakDuration);
      const breakEnd = format(currentTimePointer, "hh:mm a");

      tasks.push({
        id: `${dateStr}-${breakStart}-break`,
        date: dateStr,
        topic: isLongBreak ? "Long Break 🧘" : "Short Break ☕",
        duration: breakDuration.toString(),
        completed: false,
        type: "break",
        startTime: breakStart,
        endTime: breakEnd,
        preference: startTimeStr,
      });

      minsUsedToday += breakDuration;
    });
  });

  return tasks;
}
