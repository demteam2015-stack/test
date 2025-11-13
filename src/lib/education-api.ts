'use client';

const COMPLETED_COURSES_KEY = 'demyanenko_hub_completed_courses';

export interface CompletedCourse {
    userId: string;
    courseId: string;
    courseTitle: string;
    completionDate: string; // ISO Date string
}

const getCoursesFromStorage = (): CompletedCourse[] => {
    if (typeof window === 'undefined') return [];
    try {
        const storedData = localStorage.getItem(COMPLETED_COURSES_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Failed to read completed courses:", e);
        return [];
    }
};

const saveCoursesToStorage = (courses: CompletedCourse[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(courses));
    } catch (e) {
        console.error("Failed to save completed courses:", e);
    }
};

/**
 * Marks a course as completed for a specific user.
 */
export const completeCourse = (userId: string, courseId: string, courseTitle: string): Promise<void> => {
    return new Promise((resolve) => {
        const courses = getCoursesFromStorage();
        
        // Prevent duplicate entries
        const alreadyCompleted = courses.some(c => c.userId === userId && c.courseId === courseId);
        if (alreadyCompleted) {
            resolve();
            return;
        }

        const newCompletion: CompletedCourse = {
            userId,
            courseId,
            courseTitle,
            completionDate: new Date().toISOString(),
        };

        courses.push(newCompletion);
        saveCoursesToStorage(courses);
        
        resolve();
    });
};

/**
 * Fetches all completed courses for a specific user.
 */
export const getCompletedCourses = (userId: string): Promise<CompletedCourse[]> => {
    return new Promise((resolve) => {
        const allCompletions = getCoursesFromStorage();
        const userCompletions = allCompletions.filter(c => c.userId === userId);
        resolve(userCompletions.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()));
    });
};
