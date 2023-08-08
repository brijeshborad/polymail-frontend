import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";

export function Time(props: TimeProps) {
    const [time, setTime] = useState<string | undefined>(props.time);

    useEffect(() => {
        // let date = dayjs(props.time).format('MM/DD/YYYY hh:mm A')
        //
        // if (dayjs().diff(dayjs(props.time), 'h') < 12) {
        //     date = dayjs(props.time).format('hh:mm A')
        // }
        // setTime(date)
        const date1 = dayjs(props.time);
        const date2 = dayjs();

        let days: number = date2.diff(date1, 'day');
        let timeString: string = '';
        if (days < 1) {
            timeString = `${date2.diff(date1, 'hour')} hours ago`;
        } else {
            timeString = dayjs(props.time).format('MM/DD/YYYY hh:mm A')
        }
        setTime(timeString)
    }, [props.time])

    // const getOneDayAgo = (newDate) => {
    //     const date1 = dayjs(newDate);
    //     const date2 = dayjs();
    //
    //     let days = date2.diff(date1, 'day');
    //     if (days < 1) {
    //         return `${date2.diff(date1, 'hour')} hours ago`;
    //     } else if (date2.diff(date1, 'hour') < 1) {
    //         return `${date2.diff(date1, 'minute')} minutes ago`;
    //     } else if (date2.diff(date1, 'minute') < 1) {
    //         return `${date2.diff(date1, 'second')} seconds`;
    //     } else {
    //         return `${days} days ago`;
    //     }
    // };
    return (
        <Text fontSize={'sm'}>{time}</Text>
    )
}
