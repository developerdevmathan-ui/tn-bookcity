<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Imports\BooksImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class BookController extends Controller
{
    // GET /api/books
    // Lists all active books with pagination
    public function index(Request $request)
    {
        // 1. Get the requested language (default to 'en' if missing)
        $locale = $request->query('lang', 'en');
        $perPage = $request->query('per_page', 15);

        // 2. Fetch active books with their translations and pagination
        $books = Book::active()
            ->with(['translations' => function ($query) use ($locale) {
                $query->where('locale', $locale);
            }])
            ->paginate($perPage);

        // 3. Transform the data for React
        $formattedBooks = $books->getCollection()->map(function ($book) {
            $translation = $book->translations->first();

            return [
                'id' => $book->id,
                'sku' => $book->sku,
                'price' => (float) $book->price,
                'stock_quantity' => $book->stock_quantity,
                'in_stock' => $book->stock_quantity > 0,
                'title' => $translation ? $translation->title : 'Title not available',
                'description' => $translation ? $translation->description : '',
                'image' => $book->image_path,
                'is_active' => $book->is_active,
                'created_at' => $book->created_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'lang' => $locale,
            'data' => $formattedBooks,
            'pagination' => [
                'total' => $books->total(),
                'per_page' => $books->perPage(),
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
            ]
        ]);
    }

    // GET /api/books/{id}
    // Fetch a single book with all translations
    public function show($id, Request $request)
    {
        $book = Book::with('translations')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $book->id,
                'sku' => $book->sku,
                'price' => (float) $book->price,
                'stock_quantity' => $book->stock_quantity,
                'in_stock' => $book->stock_quantity > 0,
                'is_active' => $book->is_active,
                'image' => $book->image_path,
                'translations' => $book->translations->keyBy('locale')->map(function ($trans) {
                    return [
                        'title' => $trans->title,
                        'description' => $trans->description,
                    ];
                }),
                'created_at' => $book->created_at,
                'updated_at' => $book->updated_at,
            ]
        ]);
    }

    // POST /api/books
    // Create a new book with translations
    public function store(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'sku' => 'required|unique:books',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image_path' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'title_en' => 'required|string|max:255',
            'title_ta' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_ta' => 'nullable|string',
        ]);

        try {
            // 1. Create the Book
            $book = Book::create([
                'sku' => $validated['sku'],
                'price' => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
                'image_path' => $validated['image_path'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // 2. Add English Translation
            $book->translations()->create([
                'locale' => 'en',
                'title' => $validated['title_en'],
                'description' => $validated['description_en'] ?? null,
            ]);

            // 3. Add Tamil Translation (if provided)
            if (!empty($validated['title_ta'])) {
                $book->translations()->create([
                    'locale' => 'ta',
                    'title' => $validated['title_ta'],
                    'description' => $validated['description_ta'] ?? null,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Book created successfully!',
                'data' => [
                    'id' => $book->id,
                    'sku' => $book->sku,
                    'price' => $book->price,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create book',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    // PUT /api/books/{id}
    // Update an existing book
    public function update($id, Request $request)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'price' => 'numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'image_path' => 'nullable|string',
            'is_active' => 'boolean',
            'title_en' => 'string|max:255',
            'title_ta' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_ta' => 'nullable|string',
        ]);

        try {
            // Update book fields (only if provided)
            $updateData = [];
            foreach (['price', 'stock_quantity', 'image_path', 'is_active'] as $field) {
                if (isset($validated[$field])) {
                    $updateData[$field] = $validated[$field];
                }
            }
            if (!empty($updateData)) {
                $book->update($updateData);
            }

            // Update English translation
            if (isset($validated['title_en'])) {
                $book->translations()->updateOrCreate(
                    ['locale' => 'en'],
                    [
                        'title' => $validated['title_en'],
                        'description' => $validated['description_en'] ?? null,
                    ]
                );
            }

            // Update Tamil translation
            if (isset($validated['title_ta']) && !empty($validated['title_ta'])) {
                $book->translations()->updateOrCreate(
                    ['locale' => 'ta'],
                    [
                        'title' => $validated['title_ta'],
                        'description' => $validated['description_ta'] ?? null,
                    ]
                );
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Book updated successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update book',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    // DELETE /api/books/{id}
    // Delete a book and its translations
    public function destroy($id)
    {
        try {
            $book = Book::findOrFail($id);
            $book->delete(); // Cascades to translations

            return response()->json([
                'status' => 'success',
                'message' => 'Book deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete book',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    // POST /api/books/bulk-upload
    // Bulk import books from Excel file
    public function bulkUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:5120', // Max 5MB
        ]);

        try {
            Excel::import(new BooksImport(), $request->file('file'));

            return response()->json([
                'status' => 'success',
                'message' => 'Books imported successfully!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bulk upload failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
