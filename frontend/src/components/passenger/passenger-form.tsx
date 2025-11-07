import { Input } from "@/components/ui/input";
import {
    FaBirthdayCake,
    FaEnvelope,
    FaIdCard,
    FaPhone,
    FaUser,
} from "react-icons/fa";

interface PassengerFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  passengerType: "adult" | "child" | "infant";
}

interface PassengerFormProps {
  index: number;
  passenger: PassengerFormData;
  onUpdate: (index: number, field: string, value: string) => void;
}

export default function PassengerForm({
  index,
  passenger,
  onUpdate,
}: PassengerFormProps) {
  const getPassengerTypeLabel = (type: string) => {
    switch (type) {
      case "adult":
        return "Adult";
      case "child":
        return "Child";
      case "infant":
        return "Infant";
      default:
        return "Passenger";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FaUser className="text-primary text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Passenger {index + 1} - {getPassengerTypeLabel(passenger.passengerType)}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the required information for each traveler and be sure that
              it exactly matches the government-issued ID presented at the
              airport.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-6 grid-cols-1 gap-4 mt-6">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaIdCard className="text-primary" />
            First name<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter first name"
            type="text"
            className="mt-1"
            value={passenger.firstName}
            onChange={(e) => onUpdate(index, "firstName", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Middle name
          </label>
          <Input
            placeholder="Enter middle name"
            type="text"
            className="mt-1"
            value={passenger.middleName}
            onChange={(e) => onUpdate(index, "middleName", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaIdCard className="text-primary" />
            Last name<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter last name"
            type="text"
            className="mt-1"
            value={passenger.lastName}
            onChange={(e) => onUpdate(index, "lastName", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Suffix
          </label>
          <Input
            placeholder="Jr., Sr., III, etc."
            type="text"
            className="mt-1"
            value={passenger.suffix}
            onChange={(e) => onUpdate(index, "suffix", e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaBirthdayCake className="text-primary" />
            Date of birth<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="MM/DD/YYYY"
            type="date"
            className="mt-1"
            value={passenger.dateOfBirth}
            onChange={(e) => onUpdate(index, "dateOfBirth", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaEnvelope className="text-primary" />
            Email address<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="example@email.com"
            type="email"
            className="mt-1"
            value={passenger.email}
            onChange={(e) => onUpdate(index, "email", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaPhone className="text-primary" />
            Phone number<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="+1 (555) 000-0000"
            type="tel"
            className="mt-1"
            value={passenger.phoneNumber}
            onChange={(e) => onUpdate(index, "phoneNumber", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
