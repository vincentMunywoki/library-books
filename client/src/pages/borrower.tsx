import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Loan } from "@shared/schema";
import { format } from "date-fns";

type Props = {
  params: { name: string };
};

export default function Borrower({ params }: Props) {
  const { data: loans = [], isLoading } = useQuery<Loan[]>({
    queryKey: ['/api/loans', params.name],
    queryFn: () => fetch(`/api/loans?borrower=${params.name}`).then(r => r.json()),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Borrowing History for {params.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p className="text-muted-foreground">No borrowing history found</p>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="flex justify-between items-center">
                  <div>
                    <Link href={`/books/${loan.bookId}`}>
                      <Button variant="link" className="p-0 h-auto">
                        Book #{loan.bookId}
                      </Button>
                    </Link>
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
