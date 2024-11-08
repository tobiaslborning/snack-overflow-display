import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/info-view")

  return (
      <main className="flex flex-col gap-8">
        
      </main>
  );
}
