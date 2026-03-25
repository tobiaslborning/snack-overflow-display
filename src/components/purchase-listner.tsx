"use client";
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase/config';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import quotesData from "@/data/daily-quotes.json";


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

interface QuoteItem {
  text: string;
  author: string;
}

const fallbackQuote: QuoteItem = {
  text: "Null stress, full snack.",
  author: "SnackOverflow visdom",
};

const allQuotes: QuoteItem[] = Array.isArray(quotesData)
  ? quotesData.filter((entry): entry is QuoteItem => {
      const candidate = entry as Partial<QuoteItem>;
      return typeof candidate.text === "string" && typeof candidate.author === "string";
    })
  : [];

function getRandomQuote(): QuoteItem {
  if (allQuotes.length === 0) return fallbackQuote;
  const randomIndex = Math.floor(Math.random() * allQuotes.length);
  return allQuotes[randomIndex];
}

function getPurchaseHeadline(products: Product[]): string {
  if (products.length === 0) return "Purchase registered";
  if (products.length === 1) return products[0].name;
  return `${products[0].name} + ${products.length - 1} more`;
}

const PurchaseListener = () => {
    const [latestPayment, setLatestPayment] = useState<Payment | undefined>(undefined);
    const [isFlashing, setIsFlashing] = useState(false);
    const [show, setShow] = useState(false);
    const [quoteOfTheDay, setQuoteOfTheDay] = useState<QuoteItem>(fallbackQuote);
    const latestSeenPurchaseId = useRef<string | null>(null);


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
              const latestSnapshotDoc = snapshot.docs[0];
              const purchaseId = latestSnapshotDoc.id;

              // Get the latest document from the snapshot
              latestSeenPurchaseId.current = purchaseId;
              const latestDoc = latestSnapshotDoc.data() as TestPurchase;
              const products = latestDoc.products;
              const totalAmount = latestDoc.totalAmount;
              const last4Digits = latestDoc.last4Digits;

              const user = await getUser(last4Digits);

              // Ignore slower, stale callbacks if a newer purchase arrived while we looked up the user.
              if (latestSeenPurchaseId.current !== purchaseId) {
                return;
              }

              const payment : Payment = {
                products: products,
                userName: user ? `${user.firstName} ${user.lastName}` : undefined,
                amount: totalAmount,
                timeStamp: latestDoc.createdAt
              }
              setShow(true);
              setLatestPayment(payment);
              setQuoteOfTheDay(getRandomQuote());
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
      setQuoteOfTheDay(getRandomQuote());
    }, []);

    useEffect(() => {
      if (show && latestPayment) {
        // set show to false after 60 seconds
        const timer = setTimeout(() => setShow(false), 60000);
        return () => clearTimeout(timer);
      }
    }, [show, latestPayment]);
    
    if (!show) {
      return (
        <Card className="w-full min-h-[260px] overflow-hidden border-2 border-zinc-200 bg-white">
          <CardHeader className="font-semibold lg:text-3xl text-xl tracking-tight text-zinc-700">
            Overhørt Hall of Fame
          </CardHeader>
          <CardContent className="flex flex-1 items-center font-semibold lg:text-4xl text-3xl text-zinc-900">
            <p className="leading-tight">"{quoteOfTheDay.text}"</p>
          </CardContent>
          <CardFooter className="font-medium text-zinc-500 text-left lg:text-2xl text-lg">
            {quoteOfTheDay.author}
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className={`w-full min-h-[260px] overflow-hidden border-2 transition-all duration-500 ${isFlashing ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_0_8px_rgba(16,185,129,0.22)]' : 'border-zinc-200 bg-white'}`}>
        <CardHeader className={`font-semibold lg:text-3xl text-xl tracking-tight ${isFlashing ? 'text-emerald-900' : 'text-zinc-700'}`}>
          {latestPayment?.userName ? latestPayment.userName + " purchased:" : "New purchase:"}
        </CardHeader>
        <CardContent className='font-semibold lg:text-5xl text-3xl'>
          {latestPayment && (
            <div className='rounded-xl bg-zinc-50 p-4'>
              <p className='text-zinc-900'>{getPurchaseHeadline(latestPayment.products)}</p>
              {latestPayment.products.length > 1 && (
                <p className='mt-3 text-lg font-medium text-zinc-600 lg:text-2xl'>
                  {latestPayment.products.length + " items in this purchase"}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className={`font-medium ${isFlashing ? 'text-emerald-900' : 'text-zinc-500'} text-left grid lg:text-3xl text-xl`}>
          {latestPayment && <p>{"Total: " + latestPayment.amount + "kr"}</p>}
          {latestPayment && latestPayment.timeStamp && (
            <p className={`text-lg ${isFlashing ? 'text-emerald-900' : 'text-zinc-500'}`}>
              {latestPayment.timeStamp.toDate().toLocaleString()}
            </p>
          )}
        </CardFooter>
      </Card>
    );
};

export default PurchaseListener;
