import { Input } from "@/components/ui/input";
import { FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { MdContactPhone } from "react-icons/md";

interface EmergencyContactData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface EmergencyContactFormProps {
  emergencyContact: EmergencyContactData;
  onChange: (field: string, value: string) => void;
}

export default function EmergencyContactForm({
  emergencyContact,
  onChange,
}: EmergencyContactFormProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <MdContactPhone className="text-accent text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Emergency Contact
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provide contact information for someone we can reach in case of
            emergency.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-6 grid-cols-1 gap-4 mt-6">
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaUser className="text-accent" />
            First name<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter first name"
            type="text"
            className="mt-1"
            value={emergencyContact.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaUser className="text-accent" />
            Last name<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter last name"
            type="text"
            className="mt-1"
            value={emergencyContact.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaEnvelope className="text-accent" />
            Email address<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="example@email.com"
            type="email"
            className="mt-1"
            value={emergencyContact.email}
            onChange={(e) => onChange("email", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FaPhone className="text-accent" />
            Phone number<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="+1 (555) 000-0000"
            type="tel"
            className="mt-1"
            value={emergencyContact.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}
