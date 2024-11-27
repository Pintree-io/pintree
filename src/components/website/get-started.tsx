import { Button } from "@/components/ui/button";
import Link from "next/link";

export function GetStarted() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Pintree</h1>
        <p className="mb-6">A powerful bookmark management platform to help you better organize and share web resources</p>
        <Link href="/admin/collections">
          <Button variant="default" size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
} 