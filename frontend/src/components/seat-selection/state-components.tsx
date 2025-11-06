import { FaTimes } from "react-icons/fa";

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Loading flight details..." }: LoadingStateProps) {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-foreground">{message}</p>
            </div>
        </div>
    );
}

interface ErrorStateProps {
    error: string;
    onGoBack: () => void;
}

export function ErrorState({ error, onGoBack }: ErrorStateProps) {
    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
            <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <FaTimes className="text-destructive text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Flight</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button 
                    onClick={onGoBack}
                    className="bg-primary hover:bg-accent text-primary-foreground font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
