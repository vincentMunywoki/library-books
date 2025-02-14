import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Books from "@/pages/books";
import BookDetails from "@/pages/book-details";
import Borrower from "@/pages/borrower";

function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="font-bold text-xl">Library</a>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/books">
                <a className="hover:text-gray-300">Books</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/books" component={Books} />
      <Route path="/books/:id" component={BookDetails} />
      <Route path="/borrower/:name" component={Borrower} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
