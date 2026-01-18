import { useLocation, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Order Information Not Found</h2>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          {/* Success Icon */}
          <div className="text-6xl mb-6">✅</div>
          
          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Thank you for your order. We're excited to get your books to you!
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">₹{order.total_amount}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-bold">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">#{order.id}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-lg mb-3">What's Next?</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>You'll receive a confirmation email shortly</li>
              <li>Our team will process your order within 24 hours</li>
              <li>You'll be notified when your books are shipped</li>
              <li>Track your delivery using the order number above</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition font-bold"
            >
              Continue Shopping
            </Link>
            <button 
              onClick={() => window.print()}
              className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50 transition font-bold"
            >
              Print Order
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-gray-600 text-sm">
              Need help? <a href="mailto:support@tnbookcity.com" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
