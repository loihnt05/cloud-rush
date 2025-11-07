import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
    error: string | null;
    isAuthError?: boolean;
}

export default function ErrorDisplay({ error, isAuthError = false }: ErrorDisplayProps) {
    const navigate = useNavigate();
    const errorIcon = isAuthError ? "🔒" : "⚠️";
    const errorTitle = isAuthError ? "Access Denied" : "Error";

    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
                <div className="text-5xl mb-4">{errorIcon}</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{errorTitle}</h2>
                <p className="text-muted-foreground mb-6">{error || "An unexpected error occurred"}</p>
                {isAuthError ? (
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate("/my-bookings")}
                            className="w-full font-semibold rounded-lg hover:cursor-pointer transition-all"
                        >
                            View My Bookings
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline"
                            className="w-full font-semibold rounded-lg hover:cursor-pointer transition-all"
                        >
                            Go Home
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => navigate(-1)}
                        className="font-semibold rounded-lg hover:cursor-pointer transition-all"
                    >
                        Go Back
                    </Button>
                )}
            </div>
        </div>
    );
}
