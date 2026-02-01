# Google Authentication Setup Guide

Follow these steps to enable Google Authentication for your Cost Visualization app.

## 1. Firebase Console Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  In the left sidebar, click on **Authentication**.
4.  Click on the **Sign-in method** tab.
5.  Click **Add new provider** and select **Google**.
6.  Enable the Google provider.
7.  Set the **Project support email** (choose your email).
8.  Click **Save**.

## 2. Authorized Domains

If you are running the app locally or on a custom domain:
1.  Under the **Settings** tab in Authentication, click **Authorized domains**.
2.  Ensure `localhost` is listed. If you've deployed the app, add your deployment domain (e.g., `myapp.web.app`).

## 3. App Config (Optional but Recommended)

Ensure your `src/config.js` properly exports the necessary Firebase configuration. The infrastructure I'm building uses `auth` from `src/services/firebase.js`.

## 4. How it works in the app

-   **Anonymous Auth**: The app will still attempt to log in anonymously by default if no user is signed in. This ensures "Save to Cloud" works without a manual login.
-   **Google Sign-In**: When the user clicks "Sign in with Google", it will link the session to their Google account.
-   **Data Transition**: Currently, data is stored under `/transactions/{uid}`. If a user switches from Anonymous to Google, their UID will change, and they will see a fresh dashboard. 
    > [!TIP]
    > To keep data across logins, you would need to implement account linking, which is a possible future refinement.
