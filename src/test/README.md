# Test Documentation

This directory contains unit tests for the Cost Visualization application. We use [Vitest](https://vitest.dev/) as our testing framework.

## Running Tests

To run all tests, use the following command:
```bash
npm test
```

## Test Coverage

### Service Tests

#### [requestBuilder.test.js](./requestBuilder.test.js)
- **`normalizeType`**: Verifies that transaction types are correctly formatted (uppercase, alphanumeric only, no spaces). Handles unicode characters and null/undefined inputs.
- **`buildTransactionPayload`**: Ensures a list of transactions is correctly transformed into a payload with normalized types and stripped IDs.

#### [dataRetrievalService.test.js](./dataRetrievalService.test.js)
- **`validateAndMap`**: 
    - Validates that the input is an array.
    - Ensures all required fields (`date`, `name`, `amount`, `type`) are present.
    - Verifies that the `amount` is a valid number.
    - Maps raw data to the application model, generating unique IDs when missing.

#### [dbService.test.js](./dbService.test.js)
- **`saveTransactions`**: Verifies anonymous authentication and data persistence to Firebase.
- **`fetchTransactions`**: Tests data retrieval for the authenticated user and handles empty database states.

### Component Tests

#### [TransactionForm.test.jsx](./TransactionForm.test.jsx)
- **Rendering**: Confirms the form displays all necessary inputs and the submit button.
- **Submission**: Verifies that the `onSave` callback is triggered with correctly formatted data upon valid form submission.
- **Validation**: Ensures the form does not submit when required fields are missing.

### Sanity Tests

#### [sanity.test.js](./sanity.test.js)
- A simple test to verify that the testing environment is correctly configured and working.
