import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to the Library
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Browse our collection, borrow books, and keep track of your reading journey.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/books">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
