import { createStandaloneToast } from "@chakra-ui/react";
import React from "react";
const { toast } = createStandaloneToast()

export function Toaster(props) {
    return (
        toast({title: props.desc?.description || props.desc , status: props.type === 'error' ? 'error' : 'success', duration: 2000, isClosable: true, position: 'top-right'})
    )
}
