import { FaPaypal, FaCheck } from "react-icons/fa";

export default function PayPalInfo() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
                <FaPaypal className="text-4xl text-[#0070BA]" />
                <div>
                    <h2 className="text-xl font-bold text-foreground">PayPal Checkout</h2>
                    <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment</p>
                </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                        <FaCheck className="text-primary" />
                        <span className="text-foreground">Pay with your PayPal balance or linked account</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <FaCheck className="text-primary" />
                        <span className="text-foreground">Secure and encrypted transaction</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <FaCheck className="text-primary" />
                        <span className="text-foreground">Buyer protection included</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
