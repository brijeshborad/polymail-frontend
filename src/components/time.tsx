import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// dayjs.extend(relativeTime);

export function Time(props: TimeProps) {
    const [time, setTime] = useState<string>(props.time);

    useEffect(() => {
        let date = dayjs(props.time).format('MM/DD/YYYY hh:mm A')

        if(dayjs().diff(dayjs(props.time), 'h') < 12) {
             date = dayjs(props.time).format('hh:mm A')
        }
        setTime(date)
    }, [props.time])

    return (
        <Text fontSize={'sm'}>{time}</Text>
    )
}
