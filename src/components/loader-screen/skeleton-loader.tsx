import {Skeleton} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import React from "react";
import {Loader} from "@/models/loader";


export function SkeletonLoader(props: Loader) {
    return (
        <>
            {Array(props.skeletonLength || 15).fill(null).map((_, index) => (
                <Skeleton
                    key={index}
                    className={styles.mailListSkeleton}
                    startColor='#F3F4F6' endColor='#f3f3f3'
                    height={props.height || '60px'}
                    borderRadius={'8px'}
                    border={'1px solid #E5E7EB'}
                    width={props.width || '100%'}
                />
            ))}
        </>
    )
}
