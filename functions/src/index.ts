// eslint-diable
import admin from 'firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

admin.initializeApp()
const db = admin.firestore();

import * as functions from 'firebase-functions';

type Product = {
  name: string;
  unitPrice: number;
};

type Payment = {
  attributes: {
    maskedPan?: string;
  };
  amount: number;
};

type Payload = {
  products: Product[];
  payments: Payment[];
  amount: number;
};

export const testLog = functions.https.onRequest((request, response) => {
  console.log(" ----------- ------- HEI ------- -----------");
  response.send(`HEI`);
});


export const webhookListenerV2 = functions.https.onRequest(async (request, response) => {
  try {
    // Log the incoming request body
    console.log(JSON.stringify(request.body, null, 2));
    // Directly access jsonPayload if request.body is already parsed
    const payload: Payload = JSON.parse(request.body.payload);
    console.log('\n\nPayload:');
    console.log(payload);
    // Extract products, payments, and card details
    const products = payload.products.map((product) => {
      console.log('Product:', product);
      return {
        name: product.name,
        unitPrice: product.unitPrice
      };
    });

    const totalAmount = payload.amount / 100; // Assuming 'amount' is in cents or similar
    if (payload.payments.length === 0) {
      console.error('No payment information found');
      response.status(400).send('No payment information found');
      return;
    }
    let last4Digits = null;
    if (payload.payments[0].attributes.maskedPan) {
      last4Digits = Number(payload.payments[0].attributes.maskedPan.slice(-4)); // Last 4 digits of the card
    }

    // Save to Firestore
    const docRef = await db.collection('testPurchase').add({
      products,
      last4Digits: last4Digits,
      totalAmount,
      createdAt: Timestamp.now(),
    });

    // Update the user's total spend by finding the user with the last 4 digits of the card
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('cardNumber', '==', Number(last4Digits)).get();
    if (!userQuery.empty) {
      //find the only matching user 
      const userDoc = userQuery.docs[0];
      const userRef = userDoc.ref;
      console.log('User found:', userDoc.data());
      console.log('Updating total spend for user:', userDoc.id);
      await userRef.update({
        totalSpend: FieldValue.increment(totalAmount),
      });
    }
    else {
      console.log('No user found with the last 4 digits:', last4Digits);
    }
    

    response.status(200).send(`Document written with ID: ${docRef.id}`);
  } catch (error) {
    console.error("Error processing request:", error);
    response.status(500).send("Error processing request");
  }
});
