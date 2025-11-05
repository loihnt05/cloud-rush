import { Button } from "@/components/ui/button";
import { FaUsers } from "react-icons/fa";

interface PassengerCountHeaderProps {
  passengerCount: number;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  onAddPassenger: () => void;
}

export default function PassengerCountHeader({
  passengerCount,
  adultsCount = 0,
  childrenCount = 0,
  infantsCount = 0,
  onAddPassenger,
}: PassengerCountHeaderProps) {
  const hasBreakdown = adultsCount > 0 || childrenCount > 0 || infantsCount > 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FaUsers className="text-primary text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Number of Passengers
            </h2>
            <p className="text-sm text-muted-foreground">
              {passengerCount} {passengerCount === 1 ? "passenger" : "passengers"}
            </p>
            {hasBreakdown && (
              <p className="text-xs text-muted-foreground mt-1">
                {adultsCount > 0 && `${adultsCount} Adult${adultsCount > 1 ? 's' : ''}`}
                {adultsCount > 0 && childrenCount > 0 && ' • '}
                {childrenCount > 0 && `${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}`}
                {(adultsCount > 0 || childrenCount > 0) && infantsCount > 0 && ' • '}
                {infantsCount > 0 && `${infantsCount} Infant${infantsCount > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>
        <Button
          type="button"
          onClick={onAddPassenger}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + Add Passenger
        </Button>
      </div>
    </div>
  );
}
