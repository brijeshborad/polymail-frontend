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
            timeString = `${date2.diff(date1, 'hour')} hours ago`;
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
