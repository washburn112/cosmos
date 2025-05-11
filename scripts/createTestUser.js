const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: 'test@cosmosos.io',
      password: 'Test123!',
      displayName: 'Test User',
      emailVerified: true,
    });

    console.log('User created in Authentication:', userRecord.uid);

    // Create the user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: 'test@cosmosos.io',
      name: 'Test User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log('User document created in Firestore');

    console.log('\nTest user created successfully!');
    console.log('Email:', 'test@cosmosos.io');
    console.log('Password:', 'Test123!');
    console.log('User ID:', userRecord.uid);
  } catch (error) {
    console.error('Error creating test user:', error);
    if (error.code) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  } finally {
    process.exit();
  }
}

createTestUser(); 