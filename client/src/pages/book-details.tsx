import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertLoanSchema, type Book, type Loan } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Import necessary hooks and utilities from React Query for data fetching and mutations  
import { useQuery, useMutation } from "@tanstack/react-query";  

// Import the useLocation hook from Wouter for handling client-side routing  
import { useLocation } from "wouter";  

// Import react-hook-form for managing form state and validation  
import { useForm } from "react-hook-form";  

// Import Zod resolver to integrate Zod validation with react-hook-form  
import { zodResolver } from "@hookform/resolvers/zod";  

// Import UI components for styling and layout  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";  
import { Button } from "@/components/ui/button";  
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";  
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";  
import { Input } from "@/components/ui/input";  

// Import the schema for loan validation and TypeScript types for Book and Loan  
import { insertLoanSchema, type Book, type Loan } from "@shared/schema";  

// Import utility functions for API requests and caching  
import { apiRequest, queryClient } from "@/lib/queryClient";  

// Import a custom toast hook for displaying notifications  
import { useToast } from "@/hooks/use-toast";  

// Import date-fns for formatting dates  
import { format } from "date-fns";  


type Props = {
  params: { id: string };
};

export default function BookDetails({ params }: Props) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const bookId = parseInt(params.id);

  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
  });

  const { data: loans = [], isLoading: isLoadingLoans } = useQuery<Loan[]>({
    queryKey: ['/api/loans', bookId],
    queryFn: () => fetch(`/api/loans?bookId=${bookId}`).then(r => r.json()),
  });

  const form = useForm({
    resolver: zodResolver(insertLoanSchema),
    defaultValues: {
      bookId,
      borrowerName: "",
    },
  });

  const borrowBook = useMutation({
    mutationFn: (data: typeof form.getValues()) =>
      apiRequest("POST", "/api/loans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/loans', bookId] });
      toast({ title: "Book borrowed successfully" });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to borrow book",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const returnBook = useMutation({
    mutationFn: () => apiRequest("POST", `/api/loans/${bookId}/return`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/loans', bookId] });
      toast({ title: "Book returned successfully" });
    },
  });

  const deleteBook = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/books/${bookId}`, {}),
    onSuccess: () => {
      toast({ title: "Book deleted successfully" });
      setLocation("/books");
    },
  });

  if (isLoadingBook || !book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-lg text-muted-foreground">by {book.author}</p>
          {book.isbn && <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>}
        </div>
        <div className="space-x-2">
          {book.status === "available" ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Borrow Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Borrow Book</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => borrowBook.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="borrowerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={borrowBook.isPending}>
                      Borrow
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={() => returnBook.mutate()}>Return Book</Button>
          )}
          <Button variant="destructive" onClick={() => deleteBook.mutate()}>
            Delete Book
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLoans ? (
            <div>Loading history...</div>
          ) : loans.length === 0 ? (
            <p className="text-muted-foreground">No borrowing history yet</p>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="flex justify-between items-center">
                  <div>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setLocation(`/borrower/${loan.borrowerName}`)}
                    >
                      {loan.borrowerName}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Borrowed: {format(new Date(loan.borrowedAt), "PPP")}
                    </p>
                    {loan.returnedAt && (
                      <p className="text-sm text-muted-foreground">
                        Returned: {format(new Date(loan.returnedAt), "PPP")}
                      </p>
                    )}
                  </div>
                  <div className="text-sm">
                    {loan.returnedAt ? (
                      <span className="text-green-600">Returned</span>
                    ) : (
                      <span className="text-yellow-600">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
