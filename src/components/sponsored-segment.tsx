import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { use, useEffect, useState } from "react";

export function SponsoredSegment() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show the component every 5 minutes for 30 seconds
        const interval = setInterval(() => {
            // Show the component
            setShow(true);
            // Hide the component after 30 seconds
            setTimeout(() => {
                setShow(false);
            }, 30000); // 30,000 milliseconds = 30 seconds
        }, 300000); // 300,000 milliseconds = 5 minutes

        // Clean up the interval and timeout on component unmount
        return () => clearInterval(interval);
    }, []);

    if (!show) return null;

    return (
        <Card className="w-full">
            <CardHeader className="lg:text-5xl text-3xl font-medium">
                Sponsored segment
            </CardHeader>
            <CardContent className="flex">
                <Image unoptimized src="/images/ad.png" alt="" width={400} height={800} className="mx-auto w-1/3" />
            </CardContent>
            <CardFooter className="text-xl text-muted-foreground font-regular">
                Kjøpt på veldighetsfest
            </CardFooter>
        </Card>
    )
}