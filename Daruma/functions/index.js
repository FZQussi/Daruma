import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const checkExpiredSubscriptions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    const now = new Date();
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      const subscriptionEnd = data.subscriptionEnd ? new Date(data.subscriptionEnd) : null;

      if (subscriptionEnd && now > subscriptionEnd) {
        console.log(`Plano expirado para: ${doc.id}`);
        batch.update(doc.ref, {
          accountType: 'Free',
          subscriptionStart: null,
          subscriptionEnd: null,
        });
      }
    });

    await batch.commit();
    console.log('Verificação de subscrições concluída.');
    return null;
  });
