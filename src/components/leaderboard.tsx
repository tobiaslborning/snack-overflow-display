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
        <Card className={`w-full overflow-hidden border-2 transition-all duration-500 ${isFlashing ? 'border-emerald-400 bg-emerald-50/80 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]' : 'border-zinc-200 bg-white'}`}>
            <CardHeader className="bg-[linear-gradient(120deg,rgba(34,197,94,0.15),rgba(14,165,233,0.05))] pb-4 lg:text-4xl text-3xl font-semibold tracking-tight">
                Snack Leaderboard
            </CardHeader>
            <CardContent className="lg:text-2xl text-xl flex flex-col gap-2 pt-4">    
            {leaderboardData.map((user, index) => {
                return (
                    <div key={`${user.firstName}-${user.lastName}-${index}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex">
                            <p className="w-10 font-medium italic text-zinc-500">{index+1 +"."}</p>
                            <span className="font-medium text-zinc-800">{user.firstName + " " + user.lastName}</span>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-lg italic text-zinc-700">{user.totalSpend + "kr"}</span>
                    </div>
                    {index !== leaderboardData.length -1 && <Separator />}
                    </div>
                );
            })}
            </CardContent>
            <CardFooter className="text-lg text-zinc-500 font-medium">
                {"Top 10 vårblomster med høyest snack-portfolio"}
            </CardFooter>
        </Card>
    );
}