"use client";
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase/config';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';


interface Product {
  name: string;
  unitPrice: number;
}

interface User {
  cardNumber: number;
  firstName: string;
  lastName: string;
}

interface TestPurchase {
  products: Product[];
  last4Digits: number;       // Last 4 digits of the card number
  totalAmount: number;       // Total amount in main currency units (e.g., NOK)
  createdAt: Timestamp;      // Timestamp of document creation
}

interface Payment {
  products: Product[];
  userName: string | undefined;
  amount: number;
  timeStamp?: Timestamp;
}

const PurchaseListener: React.FC = () => {
    const [latestPayment, setLatestPayment] = useState<Payment | undefined>(undefined);
    const [isFlashing, setIsFlashing] = useState(false);
    const [show, setShow] = useState(false);


    useEffect(() => {
        // Define the document reference
        const q = query(
            collection(db, "testPurchase"), // Replace "testPurchase" with your collection name
            orderBy("createdAt", "desc"),   // Order by timestamp in descending order
            limit(1)                         // Limit to the newest document
          );
          // Set up the snapshot listener
          const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
              // Get the latest document from the snapshot
              const latestDoc = snapshot.docs[0].data() as TestPurchase;
              const products = latestDoc.products;
              const totalAmount = latestDoc.totalAmount;
              const last4Digits = latestDoc.last4Digits;

              const user = await getUser(last4Digits);

              const payment : Payment = {
                products: products,
                userName: user ? `${user.firstName} ${user.lastName}` : undefined,
                amount: totalAmount,
                timeStamp: latestDoc.createdAt
              }
              setShow(true);
              setLatestPayment(payment);
            }            
          });
          // Clean up the listener on component unmount
          return () => unsubscribe();
    }, []);

    const getUser = async (last4Digits: number) : Promise<User | undefined> => {
      const userQuery = query(
        collection(db, "users"), // Replace "users" with your collection name
        where("cardNumber", "==", last4Digits), // Find the user with matching last 4 digits
        limit(1) // Limit to 1 user
      );
      const user : User | undefined = await getDocs(userQuery).then(async (querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as User;
          return userData;
        }
        return undefined;
      }); 
      return user;
    }

    useEffect(() => {
      if (latestPayment) {
        // Trigger flashing effect
        setIsFlashing(true);
  
        // Remove flashing effect after a short delay
        const timer = setTimeout(() => setIsFlashing(false), 10000); // 500ms flash duration
  
        // Clear timer on cleanup to avoid memory leaks
        return () => clearTimeout(timer);
      }
    }, [latestPayment]);

    useEffect(() => {
      if (show) {
        // set show to false after 60 seconds
        const timer = setTimeout(() => setShow(false), 60000);
      }
    }, [show]);
    
    if (!show) {
      return <></>;
    }

    return (
      <Card className={`w-full ${isFlashing ? 'border-green-500 border-2' : 'border-border border-[1px]'}`}>
        <CardHeader className='font-medium text-muted-foreground lg:text-3xl text-xl'>
          {latestPayment?.userName ? latestPayment.userName + " purchased:" : "New purchase:"}
        </CardHeader>
        <CardContent className='font-medium lg:text-5xl text-3xl'>
          {latestPayment &&
            latestPayment.products.map((product, index) => (
              <div key={index}>
                <p>{product.name}</p>
                <p className='italic'>{product.unitPrice / 100 + "kr"}</p>
              </div>
            ))}
        </CardContent>
        <CardFooter className='font-medium text-muted-foreground lg:text-3xl text-xl'>
          {latestPayment && "Total: " + latestPayment.amount + "kr"}
        </CardFooter>
      </Card>
    );
};

export default PurchaseListener;