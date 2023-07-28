import {Text} from "@chakra-ui/react";
import {TimeProps} from "@/types";
import {useEffect, useState} from "react";

export function Time(props: TimeProps) {
    const [time, setTime] = useState<string>(props.time);

    useEffect(() => {
        setTime('7m ago')
    }, [props.time])

    return (
        <Text fontSize={'sm'}>{time}</Text>
    )
}
