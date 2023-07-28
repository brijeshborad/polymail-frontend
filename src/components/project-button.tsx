import Image from "next/image";
import {Button, ButtonGroup, Flex} from "@chakra-ui/react";
import React from "react";
import {IProfileButtonProps} from "@/types";
import styles from "@/styles/common.module.css";

export function ProjectButton(props: IProfileButtonProps) {
    return (
        <>
            <Flex className={styles.filterTabsName} align={'center'} justify={'space-between'}>
                <div className={styles.buttonContent}>
                    <ButtonGroup size={props.size || 'sm'} isAttached variant={props.variant || 'outline'}
                                 alignItems={'center'} className={`${props.buttonClass}`}>
                        {props.iconStart && (props.iconStart)}
                        {props.imageStart &&
                        <Image src={props.imageStart || '/image/user.png'} width={20} height={20} alt={''}/>}
                        <Button color={'inherit'} borderColor={'none'} border={0} className={`${styles.button}`}
                                height={'fit-content'}>{props.text || 'Save'}</Button>
                        {props.iconEnd && (props.iconEnd)}
                        {props.imageEnd &&
                        <Image src={props.imageEnd || '/image/user.png'} width={20} height={20} alt={''}/>}
                    </ButtonGroup>
                </div>
            </Flex>
        </>
    )
}
