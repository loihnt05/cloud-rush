import { FaLock } from "react-icons/fa";

export default function SecurityNotice() {
    return (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <FaLock className="text-primary mt-1" />
            <div>
                <p className="text-sm font-semibold text-foreground mb-1">Secure Payment</p>
                <p className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure. We do not store your card details.
                </p>
            </div>
        </div>
    );
}
