import LoginButton from "@/components/login-button";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
// import { FaEnvelope, FaQuestionCircle, FaPalette, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import Profile from "../profile-user";

function Header() {
    const { user, isAuthenticated} = useAuth0();

    useEffect(() => {
        // Quick debug: inspect the user object to see available profile claims
        // Remove or disable this in production
        // eslint-disable-next-line no-console
        console.log("Auth0 user:", user);
    }, [user]);

    return (
        <div className="bg-white shadow-md">
            <div className="flex items-center justify-between px-6 py-3 ">
                <img src="https://pub-08202a6e0a0e4f88a0b3f667d3b8ff4d.r2.dev/Gemini_Generated_Image_rwuccfrwuccfrwuc.png" alt="Logo" 
                className="w-10 h-10 rounded-full overflow-hidden" />
                <div className="flex gap-3">
                    <ul className="flex gap-6 text-gray-700 font-medium items-center">
                        <Link to="/flight" className="hover:text-blue-500">Flight</Link>
                        <Link to="/packages" className="hover:text-blue-500">Package</Link>
                        <Link to="/places" className="hover:text-blue-500">Places</Link>
                        {isAuthenticated ? (
                            <Profile></Profile>
                        ) : (
                            <LoginButton />
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default Header;