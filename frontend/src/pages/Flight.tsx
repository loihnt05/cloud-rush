import LoginButton from "@/components/login-button";
import { useState } from "react";

type Student = {
    name: string;
    age: number;
}

function Flight() {
    return(
        <div className="display: inline-flex">
            <img src="#" alt="Logo"></img>
    <LoginButton />
        </div>
    )
}
export default Flight;