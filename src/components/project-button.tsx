import Image from "next/image";
import {Button, ButtonGroup} from "@chakra-ui/react";
import React from "react";
import {IProfileButtonProps} from "@/types";

export function ProjectButton(props: IProfileButtonProps) {
    return (
        <>
            <ButtonGroup size={props.size || 'sm'} isAttached variant={props.variant || 'outline'}
                         alignItems={'center'}>
                {props.iconStart && (props.iconStart)}
                {props.imageStart &&
                <Image src={props.imageStart || '/image/user.png'} width={20} height={20} alt={''}/>}
                <Button _hover={'none'} _active={'none'} borderColor={'none'} border={0}
                        height={'fit-content'}>{props.text || 'Save'}</Button>
                {props.iconEnd && (props.iconEnd)}
                {props.imageEnd && <Image src={props.imageEnd || '/image/user.png'} width={20} height={20} alt={''}/>}
            </ButtonGroup>
        </>
    )
}
