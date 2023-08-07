import { createStandaloneToast } from "@chakra-ui/react";
import React from "react";
import {ToasterProps} from "@/types/props-types/toaster.type";
const { toast } = createStandaloneToast()

export function Toaster(props: ToasterProps) {
    return (
        toast({title: props.desc , status: props.type === 'error' ? 'error' : 'success', duration: 2000, isClosable: true, position: 'top-right'})
    )
}
