import { FaCreditCard, FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";

interface PaymentMethodSelectorProps {
    selectedMethod: "credit" | "paypal";
    onMethodChange: (method: "credit" | "paypal") => void;
}

export default function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">Payment Method</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => onMethodChange("credit")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        selectedMethod === "credit"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                >
                    <div className="flex flex-col items-center">
                        <FaCreditCard className={`text-3xl mb-3 ${selectedMethod === "credit" ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="text-base font-semibold text-foreground mb-2">Credit Card</p>
                        <div className="flex gap-2 mt-2">
                            <FaCcVisa className="text-2xl text-blue-600" />
                            <FaCcMastercard className="text-2xl text-orange-500" />
                            <FaCcAmex className="text-2xl text-blue-500" />
                        </div>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => onMethodChange("paypal")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        selectedMethod === "paypal"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                >
                    <div className="flex flex-col items-center">
                        <FaPaypal className={`text-3xl mb-3 ${selectedMethod === "paypal" ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="text-base font-semibold text-foreground mb-2">PayPal</p>
                        <p className="text-xs text-muted-foreground">Fast & secure checkout</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
