import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export function Time(props: TimeProps) {
    const [time, setTime] = useState<string | undefined>(props.time);

    useEffect(() => {
        const infoDate = dayjs(props.time);
        const currentDate = dayjs();
        let numberOfDaysBetweenTwoDates: number = currentDate.diff(infoDate, 'day');
        let timeString: string = '';
        if (props.isShowFullTime) {
            setTime(dayjs(props.time).format('MM/DD/YYYY hh:mm A'))
            return;
        }
        if (numberOfDaysBetweenTwoDates < 1) {
            const numberOfHoursBetweenTwoDates = currentDate.diff(infoDate, 'hour');
            if (numberOfHoursBetweenTwoDates < 1) {
                const numberOfMinutesBetweenTwoDates = currentDate.diff(infoDate, 'minutes');
                if (numberOfMinutesBetweenTwoDates < 1) {
                    const numberOfSecondsBetweenTwoDates = currentDate.diff(infoDate, 'seconds');
                    timeString = `${numberOfSecondsBetweenTwoDates} seconds ago`;
                } else {
                    timeString = `${numberOfMinutesBetweenTwoDates} mins ago`;
                }
            } else {
                timeString = `${numberOfHoursBetweenTwoDates} hours ago`;
            }
        } else if (currentDate.format('YYYY') === infoDate.format('YYYY')) {
            timeString = dayjs(props.time).format('MMM DD');
        } else {
            timeString = dayjs(props.time).format('MM/DD/YYYY')
        }
        setTime(timeString)
    }, [props.time, props.isShowFullTime])

    return (
        <Text fontSize={'sm'}>{time}</Text>
    )
}
