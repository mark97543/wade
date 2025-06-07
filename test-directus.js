// test-directus.js

// Import the necessary functions from the SDK
import { createDirectus, createUsers } from '@directus/sdk';

// Main function to run our test
async function runTest() {
  console.log('--- Starting Directus SDK Test Script ---');

  try {
    // 1. Create a Directus client instance
    const client = createDirectus('https://api.wade-usa.com');
    console.log('Client created for https://api.wade-usa.com');

    // 2. Define the new user data. Use a unique email every time.
    const uniqueEmail = `test-script-${Date.now()}@example.com`;
    const newUser = {
      first_name: 'NodeJS',
      last_name: 'Test',
      email: uniqueEmail,
      password: 'a-very-strong-password',
      role: '02f6b9d9-4b29-46cf-9639-f0e232be78b1', // The role ID you've been using
      status: 'active'
    };
    console.log('Attempting to create user:', newUser);

    // 3. Call the createUsers function
    const result = await createUsers(client, [newUser]);

    // 4. If it succeeds, log the result
    console.log('\n✅ SUCCESS! User created successfully.');
console.log('Result from server:', JSON.stringify(result, null, 2));
    console.log(`\nPlease check your Directus instance for the user with email: ${uniqueEmail}`);

  } catch (error) {
    // 5. If it fails, log the entire error object
    console.error('\n❌ FAILED! An error occurred.');
    // The Directus SDK often puts detailed errors inside the `error.errors` array.
    if (error.errors) {
        console.error('Detailed errors from SDK:', JSON.stringify(error.errors, null, 2));
    } else {
        console.error('Full error object:', error);
    }
  }
}

// Run the main function
runTest();