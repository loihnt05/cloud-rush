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
                        <Link to="/package" className="hover:text-blue-500">Package</Link>
                        <Link to="/places" className="hover:text-blue-500">Places</Link>
                    </ul>

                    <LoginButton />
                </div>
            </div>

            <div className="flex justify-center items-center my-6">
                <h1 className="text-6xl font-bold text-center">It is more than just a trip </h1>
            </div>

            <div className="flex justify-center items-center">
                <div className="w-1/5 p-4">
                    <Input placeholder="From where?"></Input>
                </div>
                <div className="w-1/5 p-4">
                    <Input placeholder="To where?"></Input>
                </div>
                <div className="w-1/5 p-4">
                    <Popover>
                        <PopoverTrigger>When?</PopoverTrigger>
                        <PopoverContent>
                            <Input type="date" />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="w-1/5 p-4">
                    <Popover>
                        <PopoverTrigger>How many pp? </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col gap-2 p-2">
                                <div className="flex items-center justify-between">
                                    <span className="w-24 px-1">Adults</span>
                                    <div className="flex items-center gap-2">
                                        <Button>-</Button>
                                        <span>1</span>
                                        <Button>+</Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="w-24 px-1">Children</span>
                                    <div className="flex items-center gap-2">
                                        <Button>-</Button>
                                        <span>1</span>
                                        <Button>+</Button>
                                    </div>
                                </div>
                            </div>

                        </PopoverContent>
                    </Popover>
                </div>
                <div className="w-1/5 p-4">
                    <button className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600">Search</button>
                </div>
            </div>
        </div>
    )
}
export default Header;