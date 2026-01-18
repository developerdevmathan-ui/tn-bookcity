<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'city',
        'state',
        'postal_code',
        'subtotal',
        'tax_amount',
        'shipping_cost',
        'total_amount',
        'payment_method',
        'payment_status',
        'transaction_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user (customer) that owns this order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all items in this order
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the status history for this order
     */
    public function statuses(): HasMany
    {
        return $this->hasMany(OrderStatus::class);
    }

    /**
     * Generate unique order number
     */
    public static function generateOrderNumber(): string
    {
        $lastOrder = self::latest('id')->first();
        $nextNumber = ($lastOrder?->id ?? 0) + 1;
        return 'ORD-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate order total
     */
    public function calculateTotal(): void
    {
        $itemsTotal = $this->items()->sum('total_price');
        $this->subtotal = $itemsTotal;
        $this->tax_amount = $itemsTotal * 0.05; // 5% tax
        $this->total_amount = $itemsTotal + $this->tax_amount + $this->shipping_cost;
        $this->save();
    }

    /**
     * Check if order is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'completed';
    }

    /**
     * Check if order is delivered
     */
    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }
}
