import {Button, Checkbox, Flex} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {TabProps} from "@/types";
import React from "react";
import {ThreadsSideBarList} from "@/components/threads";
import {SpinnerUI} from "@/components/common"

export function ThreadsSideBarTab(props: TabProps) {

    return (
        <>
            {
                props.tab === 'INBOX' && <div>
                    <Flex overflowX={'auto'} align={'center'}>
                        <div className={styles.checkBoxLabel}>
                            <Checkbox defaultChecked>Select All</Checkbox>
                        </div>

                        <div className={styles.mailOtherOption}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.active}>
                                    <Button colorScheme='white'>Everything</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Just mine</Button>
                                </div>
                                <div>
                                    <Button colorScheme='white'>Projects</Button>
                                </div>
                            </Flex>
                        </div>
                    </Flex>
                </div>
            }

            {props.showLoader && <SpinnerUI/>}
            
            <ThreadsSideBarList tab={props.tab} />
        </>
    )
}
