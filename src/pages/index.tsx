import {useEffect} from "react";
import Router from "next/router";
import {useDispatch} from "react-redux";
import {
    getAllProjects
} from "@/redux/projects/action-reducer";

export default function Home() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllProjects());
        Router.push('/onboarding');
    }, []);

    return (
        <></>
    )
}
