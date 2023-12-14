export interface ChangePasswordData {
  username: string | null,
  oldPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
}
