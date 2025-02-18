import { type Book, type InsertBook, type Loan, type InsertLoan } from "@shared/schema";

export interface IStorage {
  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  searchBooks(query: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;

  
  // Loans
  getLoans(bookId?: number): Promise<Loan[]>;
  getLoansByBorrower(borrowerName: string): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  returnBook(bookId: number): Promise<Loan | undefined>;
}

export class MemStorage implements IStorage {
  private books: Map<number, Book>;
  private loans: Map<number, Loan>;
  private bookId: number;
  private loanId: number;

  constructor() {
    this.books = new Map();
    this.loans = new Map();
    this.bookId = 1;
    this.loanId = 1;
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(
      book => 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.isbn?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const book: Book = { ...insertBook, id, status: "available" };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const existing = this.books.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async getLoans(bookId?: number): Promise<Loan[]> {
    const loans = Array.from(this.loans.values());
    if (bookId) {
      return loans.filter(loan => loan.bookId === bookId);
    }
    return loans;
  }

  async getLoansByBorrower(borrowerName: string): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      loan => loan.borrowerName.toLowerCase() === borrowerName.toLowerCase()
    );
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanId++;
    const loan: Loan = {
      ...insertLoan,
      id,
      borrowedAt: new Date(),
      returnedAt: null,
    };
    this.loans.set(id, loan);
    
    // Update book status
    const book = this.books.get(insertLoan.bookId);
    if (book) {
      this.books.set(book.id, { ...book, status: "borrowed" });
    }
    
    return loan;
  }

  async returnBook(bookId: number): Promise<Loan | undefined> {
    const loan = Array.from(this.loans.values()).find(
      l => l.bookId === bookId && !l.returnedAt
    );
    
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, returnedAt: new Date() };
    this.loans.set(loan.id, updatedLoan);
    
    // Update book status
    const book = this.books.get(bookId);
    if (book) {
      this.books.set(book.id, { ...book, status: "available" });
    }
    
    return updatedLoan;
  }
}

export const storage = new MemStorage();
