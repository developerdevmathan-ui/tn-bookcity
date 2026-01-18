<?php

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;

// This trait resets the database after every test
// so you always start with a clean slate.
uses(RefreshDatabase::class);

test('a book can be created with stock and price', function () {
    // 1. Action: Create a book
    $book = Book::create([
        'sku' => 'TEST-001',
        'price' => 500.00,
        'stock_quantity' => 10,
    ]);

    // 2. Assertion: Check if it exists in the database
    expect($book)->toBeInstanceOf(Book::class);
    $this->assertDatabaseHas('books', [
        'sku' => 'TEST-001',
    ]);
});

test('a book can have english and tamil translations', function () {
    // 1. Create a Book
    $book = Book::create([
        'sku' => 'TN-BOOK-001',
        'price' => 100,
        'stock_quantity' => 5
    ]);

    // 2. Add Translations
    $book->translations()->create([
        'locale' => 'en',
        'title' => 'History of Tamil Nadu'
    ]);

    $book->translations()->create([
        'locale' => 'ta',
        'title' => 'தமிழ்நாடு வரலாறு'
    ]);

    // 3. Assertion: Verify we can retrieve them
    expect($book->translations)->toHaveCount(2);

    // Check specifically for Tamil
    $this->assertDatabaseHas('book_translations', [
        'locale' => 'ta',
        'title' => 'தமிழ்நாடு வரலாறு'
    ]);
});

test('active scope filters inactive books', function () {
    Book::create([
        'sku' => 'ACTIVE-001',
        'price' => 99.99,
        'stock_quantity' => 10,
        'is_active' => true,
    ]);

    Book::create([
        'sku' => 'INACTIVE-001',
        'price' => 99.99,
        'stock_quantity' => 5,
        'is_active' => false,
    ]);

    $activeBooks = Book::active()->get();
    expect($activeBooks)->toHaveCount(1);
    expect($activeBooks->first()->sku)->toBe('ACTIVE-001');
});

test('in stock scope filters books with zero stock', function () {
    Book::create([
        'sku' => 'STOCK-001',
        'price' => 50.00,
        'stock_quantity' => 5,
    ]);

    Book::create([
        'sku' => 'OUT-OF-STOCK-001',
        'price' => 50.00,
        'stock_quantity' => 0,
    ]);

    $inStockBooks = Book::inStock()->get();
    expect($inStockBooks)->toHaveCount(1);
    expect($inStockBooks->first()->sku)->toBe('STOCK-001');
});

test('book price is cast to decimal', function () {
    $book = Book::create([
        'sku' => 'CAST-TEST',
        'price' => 99.99,
        'stock_quantity' => 3,
    ]);

    expect($book->price)->toBe(99.99);
    expect($book->is_active)->toBeTrue();
});
