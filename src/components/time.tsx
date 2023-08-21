import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export function Time(props: TimeProps) {
    const [time, setTime] = useState<string | undefined>(props.time);

    useEffect(() => {
        const date1 = dayjs(props.time);
        const date2 = dayjs();
        let days: number = date2.diff(date1, 'day');
        let timeString: string = '';
        if (props.isShowFullTime) {
            let timeString = dayjs(props.time).format('MM/DD/YYYY hh:mm A');
            setTime(timeString)
            return;
        }
        if (days < 1) {
            const hours = date2.diff(date1, 'hour');
            if (hours < 1) {
                const mins = date2.diff(date1, 'minutes');
                if (mins < 1) {
                    const seconds = date2.diff(date1, 'seconds');
                    timeString = `${seconds} seconds ago`;
                } else {
                    timeString = `${mins} mins ago`;
                }
            } else {
                timeString = `${hours} hours ago`;
            }
        } else if (date2.format('YYYY') === date1.format('YYYY')) {
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
