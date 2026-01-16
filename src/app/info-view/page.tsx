"use client"

import { UserIcon } from "@heroicons/react/24/solid";
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "./../../../firebase/config";
import PurchaseListener from "@/components/purchase-listner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/leaderboard";
import { SponsoredSegment } from "@/components/sponsored-segment";
import Image from "next/image";
import { User } from "firebase/auth";

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

  const resetUsersTotalSpend = async () => {
    console.log("Resetting total spend");
    const usersRef = await getDocs(collection(db, "users"));
    usersRef.forEach(async (user : any) => {
      console.log("reseting user: ", user.id, user.data().firstName, user.data().lastName);
      await updateDoc(doc(db, "users", user.id), {
        totalSpend: 0
      });
    });
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
        <div className="absolute right-[2%] bottom-10 text-center invisible md:visible ">
          <Image unoptimized src="/images/qr-new.png" alt="" width={200} height={200} className="size-28 " />
          <p className="font-medium">Register deg!</p>
        </div>
        <div className="flex justify-between">
          <div className="flex">
            <h1 className="text-3xl mt-3 font-medium" >SnackOverflow</h1>
          </div>
          {user?.email ? ( 
          <Popover>
            <PopoverTrigger>
              <Avatar className="hover:cursor-pointer mt-3" onClick={() =>{
                getUserTotalSpend(user.uid).then((spend) => {
                  console.log(user.uid);
                  console.log(spend);
                  setTotalSpend(spend);
                })
              }}>
                <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4">
              <div className="flex-col gap-2 text-xl font-regular">
                <span>{user.email}</span>
              </div>
              {totalSpend && <div className="flex-col gap-2 text-xl font-medium">
                <span>{"Total Spend: "}</span>
                <span>{totalSpend + "kr"}</span>
              </div>}
              {(user.email === "tobias@borning.no" || user.email === "adrianjlund04@gmail.com") && <Button 
                variant={"destructive"}
                onClick={() => {
                  resetUsersTotalSpend()
                }}
              >
                Reset Total Spend
              </Button>
              }
              <div className="flex gap-2 mt-2">
                <Button onClick={() => auth.signOut()}>Sign Out</Button>
              </div>
            </PopoverContent>
          </Popover>) : (
            <Avatar className="hover:cursor-pointer mt-3" onClick={() =>{
              router.push("/sign-up")
            }}>
              <AvatarFallback>
                <UserIcon className="size-4"/>
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <PurchaseListener />
        {/* <SponsoredSegment /> */}
        <Leaderboard />
      </main>
  );
}
