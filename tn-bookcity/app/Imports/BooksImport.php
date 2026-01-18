<?php

namespace App\Imports;

use App\Models\Book;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Facades\Log;

class BooksImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
     * Import a book row from Excel and create/update in database
     */
    public function model(array $row)
    {
        try {
            // 1. Create or Update the Main Book (Language Neutral)
            // We check 'sku' to avoid duplicates.
            $book = Book::firstOrCreate(
                ['sku' => $row['sku']],
                [
                    'price' => $row['price'] ?? 0,
                    'stock_quantity' => $row['stock'] ?? $row['stock_quantity'] ?? 0,
                    'image_path' => $row['image_path'] ?? null,
                    'is_active' => $row['is_active'] ?? true,
                ]
            );

            // 2. Add/Update English Translation
            if (!empty($row['title_en'])) {
                $book->translations()->updateOrCreate(
                    ['locale' => 'en'],
                    [
                        'title' => $row['title_en'],
                        'description' => $row['description_en'] ?? null
                    ]
                );
            }

            // 3. Add/Update Tamil Translation
            if (!empty($row['title_ta'])) {
                $book->translations()->updateOrCreate(
                    ['locale' => 'ta'],
                    [
                        'title' => $row['title_ta'],
                        'description' => $row['description_ta'] ?? null
                    ]
                );
            }

            return $book;
        } catch (\Exception $e) {
            Log::error('Error importing book: ' . $e->getMessage(), ['row' => $row]);
            return null;
        }
    }

    /**
     * Validation rules for Excel import
     */
    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            '*.stock' => 'required|integer|min:0',
            'title_en' => 'required|string|max:255',
            'title_ta' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_ta' => 'nullable|string',
            'image_path' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ];
    }
}
