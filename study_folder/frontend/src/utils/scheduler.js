import { format, addDays } from "date-fns";

/**
 * Generates a list of study and break tasks based on topics and time constraints.
 * @param {Array} topics - The structured topics/subtopics from the syllabus.
 * @param {string} examDate - ISO string of the target exam date.
 * @param {number} studyHours - Daily study hour limit (1-12).
 * @param {string} studyPreference - "morning" or "afternoon".
 * @returns {Array} tasks - The flattened list of tasks with dates and times.
 */
export function generateTasks(topics, examDate, studyHours, studyPreference) {
  const tasks = [];
  const today = new Date();
  const maxMinsPerDay = studyHours * 60;
  
  // Time tracking for real-time schedule
  const startHour = studyPreference === "morning" ? 8 : 14; 
  let currentStudyDate = new Date(today);
  let currentTimePointer = new Date(currentStudyDate);
  currentTimePointer.setHours(startHour, 0, 0, 0);
  
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
        currentTimePointer.setHours(startHour, 0, 0, 0);
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
        date: dateStr,
        topic: subIndex === 0 && mainItem.subtopics && mainItem.subtopics.length > 0 
          ? `${mainItem.topic}: ${subtopic}` 
          : subtopic,
        duration: "25",
        completed: false,
        type: "focus",
        startTime: focusStart,
        endTime: focusEnd,
        preference: studyPreference
      });

      minsUsedToday += 25;

      // Break
      const isLongBreak = taskCounter % 4 === 0;
      const breakDuration = isLongBreak ? 20 : 5;
      
      const breakStart = format(currentTimePointer, "hh:mm a");
      currentTimePointer.setMinutes(currentTimePointer.getMinutes() + breakDuration);
      const breakEnd = format(currentTimePointer, "hh:mm a");

      tasks.push({
        date: dateStr,
        topic: isLongBreak ? "Long Break 🧘" : "Short Break ☕",
        duration: breakDuration.toString(),
        completed: false,
        type: "break",
        startTime: breakStart,
        endTime: breakEnd,
        preference: studyPreference
      });

      minsUsedToday += breakDuration;
    });
  });

  return tasks;
}
