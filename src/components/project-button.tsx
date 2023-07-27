import Image from "next/image";
import {Button, ButtonGroup} from "@chakra-ui/react";

type IProfileButtonProps = {
    text?: string,
    image?: string,
    size?: string,
    variant?: string
}

export function ProjectButton(props: IProfileButtonProps) {
    return (
        <>
            <ButtonGroup size={props.size || 'sm'} isAttached variant={props.variant || 'outline'}>
                <Image src={props.image || '/image/user.png'} width={30} height={30} alt={''}/>
                <Button>{props.text || 'Save'}</Button>
            </ButtonGroup>
        </>
    )
}
