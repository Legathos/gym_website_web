import { WorkoutsData } from './workouts.model';

export interface MonthlyWorkoutsData {
    userId: number;
    year: number;
    month: number;
    dailyWorkouts: {
        [day: string]: WorkoutsData | null;
    };
}
