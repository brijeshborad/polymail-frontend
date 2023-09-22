import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export function Time(props: TimeProps) {
    const [_elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const dynamicDate = dayjs(props.time); // For example, you can fetch it from an API

        const timerInterval = setInterval(() => {
            const now = dayjs();
            const timeDifference = now.valueOf() - dynamicDate.valueOf();
            const secondsElapsed = Math.floor(timeDifference / 1000);

            setElapsedTime(secondsElapsed);
        }, 1000); // Update every second

        return () => {
            clearInterval(timerInterval); // Cleanup the interval when the component unmounts
        };
    }, []);

    const formatElapsedTime = () => {
        const infoDate = dayjs(props.time);
        const currentDate = dayjs();
        let numberOfDaysBetweenTwoDates: number = currentDate.diff(infoDate, 'day');
        let timeString: string = '';
        if (props.isShowFullTime) {
            return dayjs(props.time).format('MM/DD/YYYY hh:mm A');
        }
        if (numberOfDaysBetweenTwoDates < 1) {
            const numberOfHoursBetweenTwoDates = currentDate.diff(infoDate, 'hour');
            if (numberOfHoursBetweenTwoDates < 1) {
                const numberOfMinutesBetweenTwoDates = currentDate.diff(infoDate, 'minutes');
                if (numberOfMinutesBetweenTwoDates < 1) {
                    const numberOfSecondsBetweenTwoDates = currentDate.diff(infoDate, 'seconds');
                    timeString = `${numberOfSecondsBetweenTwoDates} ${props.showTimeInShortForm ? 's' : 'seconds ago'}`;
                } else {
                    timeString = `${numberOfMinutesBetweenTwoDates} ${props.showTimeInShortForm ? 'm' : 'mins ago'}`;
                }
            } else {
                timeString = `${numberOfHoursBetweenTwoDates} ${props.showTimeInShortForm ? 'h' : 'hours ago'}`;
            }
        } else if (currentDate.format('YYYY') === infoDate.format('YYYY')) {
            timeString = dayjs(props.time).format('MMM DD');
        } else {
            timeString = dayjs(props.time).format('MM/DD/YYYY')
        }

        return timeString;
    };

    return (
        props.as ? <Text as={props.as!} fontSize={'sm'}>{formatElapsedTime()}</Text> : <Text fontSize={'sm'}>{formatElapsedTime()}</Text>
    )
}
