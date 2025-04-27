import * as functions from 'firebase-functions';

// Função simples para testar
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase Functions with TypeScript!");
});

