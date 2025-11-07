export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

export function ProcessingPayment() {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Processing Payment</h2>
                <p className="text-muted-foreground">Please wait while we process your payment...</p>
            </div>
        </div>
    );
}
