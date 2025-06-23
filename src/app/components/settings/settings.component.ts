import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MemberService } from '@domain/member';
import { User, UserService, ResponseDto } from '@domain/user';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // User data
  user!: User;

  // Form groups
  accountForm!: FormGroup;
  profileForm!: FormGroup;

  // Theme settings
  currentTheme: string = 'light';

  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    // Initialize forms
    this.initForms();

    // Get user data
    this.getUserData();
  }

  /**
   * Initialize form groups
   */
  initForms(): void {
    this.accountForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required)
    });

    this.profileForm = new FormGroup({
      username: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      weight: new FormControl('', Validators.required),
      age: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required)
    });
  }

  /**
   * Get user data from the server
   */
  getUserData(): void {
    this.memberService.getUserData().subscribe({
      next: (data) => {
        this.user = data;
        this.populateFormFields();
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.showErrorMessage('Failed to load user data. Please try again later.');
      }
    });
  }

  /**
   * Populate form fields with user data
   */
  populateFormFields(): void {
    if (this.user) {
      // Populate account form
      this.accountForm.patchValue({
        email: this.user.email
      });

      // Populate profile form
      this.profileForm.patchValue({
        username: this.user.username,
        height: this.user.height,
        weight: this.user.weight,
        age: this.user.age,
        gender: this.user.gender
      });
    }
  }

  /**
   * Change the application theme
   */
  changeTheme(theme: string): void {
    this.currentTheme = theme;

    // Remove active class from all theme choices
    const themeChoices = document.querySelectorAll('.theme-choice');
    themeChoices.forEach(choice => {
      choice.classList.remove('active');
    });

    // Add active class to selected theme
    const selectedTheme = document.querySelector(`[data-theme="${theme}"]`);
    if (selectedTheme) {
      selectedTheme.classList.add('active');
    }

    // In a real application, this would update a theme service
    console.log(`Theme changed to: ${theme}`);
  }

  /**
   * Update password
   */
  updatePassword(): void {
    if (this.accountForm.get('password')?.invalid) {
      this.showErrorMessage('Please enter a valid password');
      return;
    }

    const password = this.accountForm.get('password')?.value;
    const confirmPassword = this.accountForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.showErrorMessage('Passwords do not match');
      return;
    }

    // Create user object with just the necessary fields for password update
    const userDto: User = {
      ...this.user,
      password: password
    };

    this.userService.editPassword(userDto).subscribe({
      next: (response) => {
        console.log('Password updated successfully', response);
        this.showSuccessMessage('Password updated successfully!');

        // Reset password fields
        this.accountForm.patchValue({
          password: '',
          confirmPassword: ''
        });
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.showErrorMessage('Failed to update password. Please try again later.');
      }
    });
  }

  /**
   * Update email
   */
  updateEmail(): void {
    if (this.accountForm.get('email')?.invalid) {
      this.showErrorMessage('Please enter a valid email address');
      return;
    }

    const email = this.accountForm.get('email')?.value;
    console.log('Updating email to:', email);
    console.log('Current user object:', this.user);

    // Create an object with the user ID and email
    // The user ID will be used as a path parameter in the API call
    const userDto = {
      id: this.user.id,
      email: email
    };
    console.log('User DTO for email update:', userDto);

    this.userService.editEmail(userDto).subscribe({
      next: (response) => {
        console.log('Email updated successfully', response);
        this.showSuccessMessage('Email updated successfully!');

        // Update user object with new email
        this.user.email = email;
      },
      error: (error) => {
        console.error('Error updating email:', error);

        // Log detailed error information
        if (error.error) {
          console.error('Error response body:', error.error);
        }
        if (error.status) {
          console.error('Error status code:', error.status);
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }

        // Show a more informative error message to the user
        let errorMessage = 'Failed to update email. ';
        if (error.status === 401) {
          errorMessage += 'You are not authorized. Please log in again.';
        } else if (error.status === 400) {
          errorMessage += 'Invalid data provided. Please check your input.';
        } else if (error.status === 404) {
          errorMessage += 'The server endpoint was not found.';
        } else if (error.status === 500) {
          errorMessage += 'Server error occurred. Please try again later.';
        } else {
          errorMessage += 'Please try again later.';
        }

        this.showErrorMessage(errorMessage);
      }
    });
  }

  /**
   * Update profile settings
   */
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.showErrorMessage('Please fill in all required fields');
      return;
    }

    // Get values from the form
    const formValues = this.profileForm.value;
    console.log('Updating profile with values:', formValues);
    console.log('Current user object:', this.user);

    // Check if username is being changed
    const isUsernameChanged = this.user.username !== formValues.username;

    // Create a userDto object with the form values and the user's ID
    const userDto: User = {
      ...this.user,
      username: formValues.username,
      height: formValues.height,
      weight: formValues.weight,
      age: formValues.age,
      gender: formValues.gender
    };
    console.log('User DTO for profile update:', userDto);

    // Call the editUser method in the UserService
    this.userService.editUser(userDto).subscribe({
      next: (response) => {
        console.log('Profile updated successfully', response);

        // Update the user object with the new values
        this.user = {
          ...this.user,
          username: formValues.username,
          height: formValues.height,
          weight: formValues.weight,
          age: formValues.age,
          gender: formValues.gender
        };

        // If username was changed, handle the authentication update
        if (isUsernameChanged) {
          this.handleUsernameChange();
        } else {
          this.showSuccessMessage('Profile settings updated successfully!');
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);

        // Log detailed error information
        if (error.error) {
          console.error('Error response body:', error.error);
        }
        if (error.status) {
          console.error('Error status code:', error.status);
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }

        // Show a more informative error message to the user
        let errorMessage = 'Failed to update profile. ';
        if (error.status === 401) {
          errorMessage += 'You are not authorized. Please log in again.';
        } else if (error.status === 400) {
          errorMessage += 'Invalid data provided. Please check your input.';
        } else if (error.status === 404) {
          errorMessage += 'The server endpoint was not found.';
        } else if (error.status === 500) {
          errorMessage += 'Server error occurred. Please try again later.';
        } else {
          errorMessage += 'Please try again later.';
        }

        this.showErrorMessage(errorMessage);
      }
    });
  }

  /**
   * Handle username change by logging out the user and redirecting to login page
   */
  private handleUsernameChange(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        question: 'Your username has been updated successfully! You need to log in again with your new username.',
        action: 'OK'
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Delete the auth cookie to log out the user
      this.cookieService.delete("auth-cookie", "/");

      // Redirect to login page
      this.router.navigateByUrl('login');
    });
  }

  /**
   * Show a confirmation dialog before deleting account
   */
  confirmDeleteAccount(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        question: 'Are you sure you want to delete your account? This action cannot be undone.',
        action: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Account deletion confirmed, deleting user with ID:', this.user.id);

        // Call the service to delete the user's account
        this.userService.deleteUserById(this.user.id).subscribe({
          next: () => {
            console.log('User deleted successfully');
            this.showSuccessMessage('Your account has been deleted. You will be redirected to the home page.');

            // Delete the auth cookie to log out the user
            this.cookieService.delete("auth-cookie", "/");

            // Redirect to home page
            setTimeout(() => {
              this.router.navigateByUrl('/');
            }, 1500);
          },
          error: (error) => {
            console.error('Error deleting user:', error);

            // Log detailed error information
            if (error.error) {
              console.error('Error response body:', error.error);
            }
            if (error.status) {
              console.error('Error status code:', error.status);
            }
            if (error.message) {
              console.error('Error message:', error.message);
            }

            // Show a more informative error message to the user
            let errorMessage = 'Failed to delete account. ';
            if (error.status === 401) {
              errorMessage += 'You are not authorized. Please log in again.';
            } else if (error.status === 404) {
              errorMessage += 'User not found.';
            } else if (error.status === 500) {
              errorMessage += 'Server error occurred. Please try again later.';
            } else {
              errorMessage += 'Please try again later.';
            }

            this.showErrorMessage(errorMessage);
          }
        });
      }
    });
  }

  /**
   * Show a success message
   */
  private showSuccessMessage(message: string): void {
    this.dialog.open(DialogComponent, {
      data: {
        question: message,
        action: 'OK'
      }
    });
  }

  /**
   * Show an error message
   */
  private showErrorMessage(message: string): void {
    this.dialog.open(DialogComponent, {
      data: {
        question: message,
        action: 'OK'
      }
    });
  }
}
