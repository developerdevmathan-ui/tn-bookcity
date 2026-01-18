<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Authentication Routes (Public - No Login Needed)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// Book Routes - Public (Read Only)
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);      // List all books
    Route::get('/{id}', [BookController::class, 'show']);   // Get single book
});

// Protected Routes (Login Required)
Route::middleware('auth:sanctum')->group(function () {

    // Admin Only Routes (Create, Update, Delete Books)
    Route::middleware('admin')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);
        Route::post('/books/upload', [BookController::class, 'bulkUpload']);
    });

    // User and Admin Order Routes
    Route::prefix('orders')->group(function () {
        // Admin Only - List and manage all orders
        Route::middleware('admin')->group(function () {
            Route::get('/', [OrderController::class, 'index']); // List all orders
            Route::put('/{id}/status', [OrderController::class, 'updateStatus']); // Update order status
            Route::delete('/{id}', [OrderController::class, 'cancel']); // Cancel order
        });

        // User routes (all authenticated users)
        Route::post('/', [OrderController::class, 'store']); // Create new order (all users)
        Route::get('/my-orders', [OrderController::class, 'userOrders']); // Get user's orders
        Route::get('/{id}', [OrderController::class, 'show']); // Get order details
    });

    // User Profile Route
    Route::get('/profile', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'is_admin' => $request->user()->is_admin,
            ]
        ]);
    });
});
