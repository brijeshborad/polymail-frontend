import {useEffect} from "react";
import Router from 'next/router';

function OnBoarding() {
    useEffect(() => {
        Router.push('/onboarding/signup');
    }, []);
    return null
}

export default OnBoarding;
