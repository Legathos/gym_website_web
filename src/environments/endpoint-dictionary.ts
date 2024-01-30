const apiUrl = 'http://localhost:8080/';

export const EndpointDictionary = {
  register:`${apiUrl}user/register`,
  getUserInfoByUsername:`${apiUrl}user/get-user-username-`,
  getUserInfo:`${apiUrl}get-user-info-`,
  deleteUser: `${apiUrl}delete-user-`,
  editUser:`${apiUrl}edit-user`,
  updateUserWeight:`${apiUrl}weight-history-user-`,
  changePassword:`${apiUrl}change-password`,
  addWorkout:`${apiUrl}add-workout`,
  getWorkoutById:`${apiUrl}get-workout-`,
  getWorkoutByUserId:`${apiUrl}get-workouts-by-userid-`,
  editWorkout:`${apiUrl}edit-workout`,
  deleteWorkout:`${apiUrl}delete-workout-`,
  addExercise:`${apiUrl}add-exercise`,
  getExerciseById:`${apiUrl}get-exercise-`,
  getAllExercises:`${apiUrl}get-all-exercises/`,
  getExercisesByCategory:`${apiUrl}get-exercises-by-`,
  deleteExerciseById:`${apiUrl}delete-exercise-`,
  editExercise:`${apiUrl}edit-exercise`,
  addFoodItem:`${apiUrl}add-food-item`,
  editFoodItem:`${apiUrl}edit-food-item`,
  deleteFoodItem:`${apiUrl}delete-food-item-`,
  getFoodItemById:`${apiUrl}get-food-item-`,
  getAllFoodItems:`${apiUrl}food/get-food-items`,
  getuserWeightHistory:`${apiUrl}user/weight-history-user-`,
  checkIfUserExists:`${apiUrl}user/check-if-user-exists`
};
