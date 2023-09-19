import {useEffect} from "react";
import Router from "next/router";

export default function Home() {
    useEffect(() => {
        Router.push('/onboarding');
    }, []);
    return (
        <></>
    )
}
