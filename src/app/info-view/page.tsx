"use client"

import { UserIcon } from "@heroicons/react/24/solid";
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "./../../../firebase/config";
import PurchaseListener from "@/components/purchase-listner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter()
  const [totalSpend, setTotalSpend] = useState<number | undefined>(undefined);

  const getUserTotalSpend = async (uid : string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log("Document data:", userSnap.data());
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
    const userData = userSnap.data();
    const totalSpend = userData?.totalSpend;
    return totalSpend;
  }

  useEffect(() => {
    // If loading is true, Firebase Auth is still initializing
    if (loading) return;
    // If user is not authenticated, redirect to login page
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  
  if (error) return <div>Error: {error.message}</div>;

  return (
      <main className="flex flex-col gap-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-medium" >SnackOverflow</h1>
          {user?.email ? ( 
          <Popover>
            <PopoverTrigger>
              <Avatar className="hover:cursor-pointer" onClick={() =>{
                getUserTotalSpend(user.uid).then((spend) => {
                  console.log(user.uid);
                  console.log(spend);
                  setTotalSpend(spend);
                })
              }}>
                <AvatarFallback>{user.email.charAt(0)}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent>
              {totalSpend && <div className="flex-col gap-2 text-xl font-medium">
                <span>{"Total Spend: "}</span>
                <span>{totalSpend + "kr"}</span>
                
              </div>}
              <div className="flex gap-2 mt-2">
                <Button onClick={() => auth.signOut()}>Sign Out</Button>
              </div>
            </PopoverContent>
          </Popover>) : (
            <Avatar className="hover:cursor-pointer" onClick={() =>{
              router.push("/sign-up")
            }}>
              <AvatarFallback>
                <UserIcon className="size-4"/>
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <PurchaseListener />
      </main>
  );
}
