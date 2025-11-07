import { FaCreditCard, FaUser, FaCalendarAlt, FaLock } from "react-icons/fa";

interface CreditCardFormProps {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    onCardNumberChange: (value: string) => void;
    onCardNameChange: (value: string) => void;
    onExpiryChange: (value: string) => void;
    onCvvChange: (value: string) => void;
}

export default function CreditCardForm({
    cardNumber,
    cardName,
    expiryDate,
    cvv,
    onCardNumberChange,
    onCardNameChange,
    onExpiryChange,
    onCvvChange,
}: CreditCardFormProps) {
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, "");
        if (value.length <= 16 && /^\d*$/.test(value)) {
            onCardNumberChange(formatCardNumber(value));
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        if (value.length <= 5) {
            onExpiryChange(value);
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 3 && /^\d*$/.test(value)) {
            onCvvChange(value);
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">Card Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <FaCreditCard className="text-primary" />
                        Card Number<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <FaUser className="text-primary" />
                        Cardholder Name<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={cardName}
                        onChange={(e) => onCardNameChange(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            Expiry Date<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={expiryDate}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <FaLock className="text-primary" />
                            CVV<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={cvv}
                            onChange={handleCvvChange}
                            placeholder="123"
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
