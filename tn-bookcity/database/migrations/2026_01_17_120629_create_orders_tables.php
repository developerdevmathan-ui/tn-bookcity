<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. The Main Order Receipt
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Link to customer
            $table->string('order_number')->unique(); // e.g., ORD-001, ORD-002
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();

            // Shipping Address
            $table->string('shipping_address');
            $table->string('city');
            $table->string('state');
            $table->string('postal_code');

            // Order Summary
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // Payment Info
            $table->string('payment_method')->nullable(); // credit_card, upi, net_banking, etc
            $table->string('payment_status')->default('pending'); // pending, completed, failed
            $table->string('transaction_id')->nullable()->unique();

            // Order Status
            $table->string('status')->default('pending'); // pending, confirmed, processing, shipped, delivered, cancelled
            $table->text('notes')->nullable();

            $table->timestamps();
        });

        // 2. The Items inside the Order
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->string('book_title'); // Store title at time of purchase
            $table->string('book_sku');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2); // Price at time of purchase
            $table->decimal('total_price', 10, 2); // unit_price * quantity

            $table->timestamps();
        });

        // 3. Order Status Tracking
        Schema::create('order_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('status'); // pending, confirmed, processing, shipped, delivered, cancelled
            $table->text('comment')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_statuses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
