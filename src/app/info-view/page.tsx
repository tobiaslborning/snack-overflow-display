"use client"

import { UserIcon } from "@heroicons/react/24/solid";
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "./../../../firebase/config";
import PurchaseListener from "@/components/purchase-listner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/leaderboard";
import Image from "next/image";

interface UserStats {
  firstName?: string;
  lastName?: string;
  totalSpend?: number;
}

interface PurchaseStats {
  createdAt?: Timestamp;
}

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter()
  const [totalSpend, setTotalSpend] = useState<number | undefined>(undefined);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [purchasesToday, setPurchasesToday] = useState(0);

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

  useEffect(() => {
    const usersQuery = query(collection(db, "users"), orderBy("totalSpend", "desc"));
    const purchasesQuery = query(collection(db, "testPurchase"), orderBy("createdAt", "desc"));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map((entry) => entry.data() as UserStats);
      setRegisteredUsers(users.length);
    });

    const unsubscribePurchases = onSnapshot(purchasesQuery, (snapshot) => {
      const purchases = snapshot.docs.map((entry) => entry.data() as PurchaseStats);
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const purchasesInDay = purchases.filter((purchase) => {
        if (!purchase.createdAt) return false;
        return purchase.createdAt.toDate() >= startOfDay;
      }).length;

      setPurchasesToday(purchasesInDay);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePurchases();
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (error) return <div>Error: {error.message}</div>;

  const accountControl = user?.email ? (
    <Popover>
      <PopoverTrigger>
        <Avatar className="hover:cursor-pointer" onClick={() => {
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
    </Popover>
  ) : (
    <Avatar className="hover:cursor-pointer" onClick={() => {
      router.push("/sign-up")
    }}>
      <AvatarFallback>
        <UserIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );

  return (
      <main className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-3 pb-6 pt-4 md:px-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_52%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_60%)]" />

        <section className="grid items-start gap-4 lg:grid-cols-[1fr_1.1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-zinc-200/80 bg-white/85 p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)] backdrop-blur md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">©Borning x Lund</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">SnackOverflow</h1>
                  <p className="mt-3 max-w-xl text-base text-zinc-600 md:text-lg">Live infoskjerm for Abakus</p>
                </div>
                <div className="shrink-0">
                  {accountControl}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text font-semibold uppercase tracking-[0.2em] text-orange-700">Registered Snackers</p>
                <p className="mt-2 text-4xl font-semibold text-orange-900">{registeredUsers}</p>
                
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text font-semibold uppercase tracking-[0.2em] text-sky-700">Purchases Today</p>
                <p className="mt-2 text-4xl font-semibold text-sky-900">{purchasesToday}</p>
                
                
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xl font-semibold uppercase tracking-[0.2em] text-zinc-500">Join The Board</p>
              <Image unoptimized src="/images/qr-new.png" alt="Registration QR code" width={220} height={220} className="mx-auto mt-3 size-40" />
              <p className="mt-1 text-center text-xl font-medium text-zinc-800">Register deg for evig snack glory</p>
            </div>

          </aside>

          <div className="flex flex-col gap-4">
            <PurchaseListener />
            <Leaderboard />
          </div>
        </section>
      </main>
  );
}
