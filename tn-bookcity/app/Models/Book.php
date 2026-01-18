<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $table = 'books';

    protected $fillable = ['sku', 'price', 'stock_quantity', 'image_path', 'is_active'];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationship: A book has many translations (English, Tamil, etc.)
    public function translations(): HasMany
    {
        return $this->hasMany(BookTranslation::class);
    }

    // Scope: Get only active books
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: Get books with stock available
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}
