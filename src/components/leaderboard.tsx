import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";

interface User {
    firstName: string;
    lastName: string;
    totalSpend: number;
}


export function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
    const [isFlashing, setIsFlashing] = useState(false);

    function areArraysEqual(arr1 : User[], arr2 : User[]) : boolean {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((obj, index) => JSON.stringify(obj) === JSON.stringify(arr2[index]));
      }

    useEffect(() => {
        // Define the document reference
        const q = query(
            collection(db, "users"), // Replace "testPurchase" with your collection name
            orderBy("totalSpend", "desc"),   // Order by timestamp in descending order
            limit(10)                         // Limit to the newest document
          );
          // Set up the snapshot listener
          const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                // Get the latest document from the snapshot
                const latestDoc : User[] = snapshot.docs.map(doc => doc.data()) as User[];
                if (areArraysEqual(leaderboardData, latestDoc)) return;
                setLeaderboardData(latestDoc);
            }            
          });
          // Clean up the listener on component unmount
          return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (leaderboardData.length > 0) {
          // Trigger flashing effect
          setIsFlashing(true);
    
          // Remove flashing effect after a short delay
          const timer = setTimeout(() => setIsFlashing(false), 10000); // 500ms flash duration
    
          // Clear timer on cleanup to avoid memory leaks
          return () => clearTimeout(timer);
        }
      }, [leaderboardData]);

    return (
        <Card className={`w-full ${isFlashing ? 'border-green-500 border-2' : 'border-border border-[1px]'}`}>
            <CardHeader className="lg:text-5xl text-3xl font-medium">
                Leaderboard
            </CardHeader>
            <CardContent className="lg:text-2xl text-xl flex flex-col gap-2">    
            {leaderboardData.map((user, index) => {
                return (
                    <>
                    <div className="flex justify-between" key={index}>
                        <div className="flex">
                            <p className="w-8 font-regular italic">{index+1 +"."}</p>
                            <span className="font-regular">{user.firstName + " " + user.lastName}</span>
                        </div>
                        <span className="italic">{user.totalSpend + "kr"}</span>
                    </div>
                    {index !== leaderboardData.length -1 && <Separator />}
                    </>

                );
            })}
            </CardContent>
            <CardFooter className="text-xl text-muted-foreground font-regular">
                Top 10 spenders since 8. november
            </CardFooter>
        </Card>
    );
}