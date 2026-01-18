<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookTranslation extends Model
{
    protected $table = 'book_translations';
    protected $fillable = ['book_id', 'locale', 'title', 'description'];

    // Relationship: A translation belongs to a book
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
