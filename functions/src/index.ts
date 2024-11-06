// eslint-diable
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import admin from 'firebase-admin';

admin.initializeApp()
const db = admin.firestore();

import * as functions from 'firebase-functions';

export const testLog = functions.https.onRequest((request, response) => {
  console.log(" ----------- ------- HEI ------- -----------");
  response.send(`HEI`);
});

export const webhookListener = functions.https.onRequest(async (request, response) => {
  const docRef = await db.collection('testPurchase').add({content: "hei"});
  response.send(`Document written with ID: ${docRef.id}`);
});

export const webhookListenerV2 = functions.https.onRequest(async (request, response) => {
  const payload = JSON.parse(request.body.payload);
  console.log(JSON.stringify(request.body, null, 2));
  console.log(" ---------------  ----------- --------------")
  console.log(JSON.stringify(payload, null, 2));
  const products = payload.products;
  const payments = payload.payments;
  const docRef = await db.collection('testPurchase').add({content: `${JSON.stringify(products.map(e => e.name))}, ${payments[0].amount / 100}kr`});
  response.send(`Document written with ID: ${docRef.id}`);
});

