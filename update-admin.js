// Script para actualizar admin role en Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateAdminRole() {
  try {
    // Buscar el usuario con email admin@test.com
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', 'admin@test.com').get();
    
    if (snapshot.empty) {
      console.log('No user found with email admin@test.com');
      console.log('Listing all users...');
      const allUsers = await usersRef.get();
      allUsers.forEach(doc => {
        console.log(`${doc.id}: ${doc.data().email} - ${doc.data().role}`);
      });
      return;
    }
    
    snapshot.forEach(async (doc) => {
      console.log(`Found user: ${doc.id}`);
      console.log(`Current role: ${doc.data().role}`);
      
      // Actualizar a admin
      await usersRef.doc(doc.id).update({
        role: 'admin',
        adminPin: '1234'
      });
      
      console.log(`✅ Role updated to admin for ${doc.id}`);
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdminRole();
