const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function ensureUser(email, password, displayName, role) {
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
    console.log(`User already exists: ${userRecord.uid}`);
  } catch (e) {
    userRecord = await admin.auth().createUser({ email, password, displayName });
    console.log(`Created user: ${userRecord.uid}`);
  }
  // Add user doc to Firestore
  await db.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName,
    role,
  });
  return userRecord.uid;
}

async function seed() {
  // 1. Create users
  const adminId = await ensureUser('admin@cosmosos.io', 'Admin123!', 'Admin User', 'admin');
  const userId = await ensureUser('test@cosmosos.io', 'Test123!', 'Test User', 'user');

  // 2. Add investments
  const investments = [
    {
      name: 'Acme Corp',
      description: 'A leading widget manufacturer.',
      amount: 1000000,
      investmentDate: '2024-06-01',
      status: 'active',
      ownerId: userId,
    },
    {
      name: 'Beta Holdings',
      description: 'Diversified investment group.',
      amount: 500000,
      investmentDate: '2024-05-15',
      status: 'active',
      ownerId: userId,
    },
    {
      name: 'Gamma Ventures',
      description: 'Tech-focused venture capital.',
      amount: 2000000,
      investmentDate: '2024-04-10',
      status: 'active',
      ownerId: adminId,
    },
  ];

  const investmentRefs = [];
  for (const inv of investments) {
    const ref = await db.collection('investments').add(inv);
    investmentRefs.push({ id: ref.id, ...inv });
    console.log('Added investment:', inv.name);
  }

  // 3. Add operating companies
  const companies = [
    {
      name: 'Acme Subsidiary',
      investmentId: investmentRefs[0].id,
    },
    {
      name: 'Beta Tech',
      investmentId: investmentRefs[1].id,
    },
    {
      name: 'Gamma Labs',
      investmentId: investmentRefs[2].id,
    },
  ];

  const companyRefs = [];
  for (const comp of companies) {
    const ref = await db.collection('operatingCompanies').add(comp);
    companyRefs.push({ id: ref.id, ...comp });
    console.log('Added company:', comp.name);
  }

  // 4. Add financial data (multiple periods)
  const financialData = [
    // Acme Subsidiary
    {
      companyId: companyRefs[0].id,
      date: '2024-06-01', revenue: 120000, ebitda: 25000, cashflow: 18000, headcount: 55, arAging: { current: 6000, '30': 2500, '60': 1200 },
    },
    {
      companyId: companyRefs[0].id,
      date: '2024-05-01', revenue: 110000, ebitda: 22000, cashflow: 15000, headcount: 54, arAging: { current: 5000, '30': 2000, '60': 1000 },
    },
    // Beta Tech
    {
      companyId: companyRefs[1].id,
      date: '2024-06-01', revenue: 80000, ebitda: 15000, cashflow: 12000, headcount: 40, arAging: { current: 4000, '30': 1500, '60': 800 },
    },
    {
      companyId: companyRefs[1].id,
      date: '2024-05-01', revenue: 75000, ebitda: 14000, cashflow: 11000, headcount: 39, arAging: { current: 3500, '30': 1200, '60': 700 },
    },
    // Gamma Labs
    {
      companyId: companyRefs[2].id,
      date: '2024-06-01', revenue: 200000, ebitda: 50000, cashflow: 40000, headcount: 80, arAging: { current: 10000, '30': 4000, '60': 2000 },
    },
    {
      companyId: companyRefs[2].id,
      date: '2024-05-01', revenue: 180000, ebitda: 45000, cashflow: 35000, headcount: 78, arAging: { current: 9000, '30': 3500, '60': 1800 },
    },
  ];

  for (const fd of financialData) {
    await db.collection('financialData').add(fd);
    console.log('Added financial data for company:', fd.companyId, fd.date);
  }

  // 5. Add chat history
  const chatHistory = [
    {
      userId: userId,
      timestamp: new Date().toISOString(),
      message: 'What is the latest revenue?',
      response: 'The latest revenue is $120,000 for Acme Subsidiary.',
    },
    {
      userId: adminId,
      timestamp: new Date().toISOString(),
      message: 'Show me all investments.',
      response: 'You have 3 investments: Acme Corp, Beta Holdings, Gamma Ventures.',
    },
  ];
  for (const chat of chatHistory) {
    await db.collection('chat_history').add(chat);
    console.log('Added chat history for user:', chat.userId);
  }

  // 6. Add email history
  const emailHistory = [
    {
      userId: userId,
      type: 'report',
      content: 'Monthly report sent for Acme Corp.',
      timestamp: new Date().toISOString(),
    },
    {
      userId: adminId,
      type: 'welcome',
      content: 'Welcome to Cosmos, Admin User!',
      timestamp: new Date().toISOString(),
    },
  ];
  for (const email of emailHistory) {
    await db.collection('email_history').add(email);
    console.log('Added email history for user:', email.userId);
  }

  console.log('Comprehensive test data seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding test data:', err);
  process.exit(1);
}); 