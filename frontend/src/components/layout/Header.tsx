import LoginButton from "@/components/login-button";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "../ui/popover";
import Button from "../ui/button";

function Header() {
    return (
        <div className="bg-white shadow-md">
            <div className="flex items-center justify-between px-6 py-3 ">
                <img src="#" alt="Logo" className="w-10 h-10" />
                <div className="flex items-center gap-3">
                    <ul className="flex gap-6 text-gray-700 font-medium">
                        <Link to="/flight" className="hover:text-blue-500">Flight</Link>
                        <Link to="/packages" className="hover:text-blue-500">Package</Link>
                        <Link to="/places" className="hover:text-blue-500">Places</Link>
                    </ul>

                    <LoginButton />
                </div>
            </div>
        </div>
    )
}
export default Header;