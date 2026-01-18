<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatus;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Create a new order from cart
     */
    public function store(Request $request)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string|max:20',
            'shipping_address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'required|string',
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|integer|exists:books,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
        ]);

        try {
            // Use a Transaction: Either everything saves, or nothing saves (Safety first!)
            DB::beginTransaction();

            // 2. Calculate totals
            $subtotal = 0;
            $cartItems = [];

            // Validate stock and prepare cart items
            foreach ($validated['cart'] as $item) {
                $book = Book::findOrFail($item['id']);

                // Check stock
                if ($book->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for: {$book->sku}");
                }

                $lineTotal = $item['price'] * $item['quantity'];
                $subtotal += $lineTotal;

                $cartItems[] = [
                    'book' => $book,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $lineTotal,
                ];
            }

            // Calculate taxes and shipping
            $taxAmount = $subtotal * 0.05; // 5% tax
            $shippingCost = 0; // Free shipping for now
            $totalAmount = $subtotal + $taxAmount + $shippingCost;

            // 3. Create the Order
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'payment_method' => null,
                'payment_status' => 'pending',
                'status' => 'pending',
            ]);

            // 4. Create Order Items and update stock
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $cartItem['book']->id,
                    'book_title' => $cartItem['book']->translations->first()->title ?? $cartItem['book']->sku,
                    'book_sku' => $cartItem['book']->sku,
                    'quantity' => $cartItem['quantity'],
                    'unit_price' => $cartItem['unit_price'],
                    'total_price' => $cartItem['total_price'],
                ]);

                // Reduce stock
                $cartItem['book']->decrement('stock_quantity', $cartItem['quantity']);
            }

            // 5. Create initial order status
            OrderStatus::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'comment' => 'Order created',
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully!',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Order creation failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Get all orders (Admin only)
     */
    public function index()
    {
        $orders = Order::with(['items', 'statuses'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Get a specific order
     */
    public function show($id)
    {
        $order = Order::with(['items.book', 'statuses'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    /**
     * Get user's orders
     */
    public function userOrders()
    {
        $orders = auth()->user()->orders()
            ->with(['items', 'statuses'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Update order status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'comment' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $order = Order::findOrFail($id);
            $order->update(['status' => $validated['status']]);

            // Log status change
            OrderStatus::create([
                'order_id' => $order->id,
                'status' => $validated['status'],
                'comment' => $validated['comment'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order status updated',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Cancel an order
     */
    public function cancel($id)
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($id);

            // Restore stock
            foreach ($order->items as $item) {
                $item->book->increment('stock_quantity', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);

            OrderStatus::create([
                'order_id' => $order->id,
                'status' => 'cancelled',
                'comment' => 'Order cancelled',
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order cancelled successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
