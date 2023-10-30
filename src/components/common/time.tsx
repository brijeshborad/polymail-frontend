import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import Tooltip from "@/components/common/Tooltip";

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
        // eslint-disable-next-line
    }, []);

    const formatElapsedTime = () => {
        const infoDate = dayjs(props.time);
        const currentDate = dayjs();
        let numberOfDaysBetweenTwoDates: number = currentDate.diff(infoDate, 'day');
        let timeString: string = '';
        let fullTime: string = '';
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
            fullTime = 'Today at ' + infoDate.format('hh:mm:ss A');
        } else if (currentDate.format('YYYY') === infoDate.format('YYYY')) {
            timeString = dayjs(props.time).format('MMM DD');
            fullTime = infoDate.format('DD/MM/YYYY') + ' at ' + infoDate.format('hh:mm:ss A');
        } else {
            timeString = dayjs(props.time).format('MM/DD/YYYY')
            fullTime = infoDate.format('DD/MM/YYYY') + ' at ' + infoDate.format('hh:mm:ss A');
        }

        return <Tooltip label={fullTime} placement={'top'}>{timeString}</Tooltip>;
    };

    return (
        props.as ? <Text as={props.as!} fontSize={props.fontSize || 'sm'}>{formatElapsedTime()}</Text> :
            <Text fontSize={props.fontSize || 'sm'}>{formatElapsedTime()}</Text>
    )
}
