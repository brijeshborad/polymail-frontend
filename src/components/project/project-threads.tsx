import {
    Button,
    Checkbox,
    Flex,
    GridItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";

import {ChevronDownIcon} from "@chakra-ui/icons";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getAllThreads, updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {Thread} from "@/models";
import {SpinnerUI, Time} from "@/components/common";
import {useRouter} from "next/router";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateDraftState} from "@/redux/draft/action-reducer";

export function ProjectThreads() {
    const {
        threads,
        selectedThread,
        isLoading
    } = useSelector((state: StateType) => state.threads);
    const dispatch = useDispatch();

    const handleClick = useCallback((item: Thread) => {
            if ((item.mailboxes || []).includes('UNREAD')) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(item) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);
                let finalArray = (item.mailboxes || []).filter(function (item: string) {
                    return item !== 'UNREAD'
                })
                let body = {
                    mailboxes: [
                        ...finalArray
                    ]
                }
                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body?.mailboxes || []
                };
                dispatch(updateThreadState({threads: currentThreads, success: true}));
                dispatch(updateThreads({id: item.id, body}));
            }
            dispatch(updateThreadState({selectedThread: item}));
            dispatch(updateMessageState({selectedMessage: null}));
            dispatch(updateDraftState({draft: null}));
    }, [dispatch, threads])

    return (
        <>
            <GridItem w='100%' h='100%'>
                <Flex direction={'column'} gap={4}>
                    <Flex align={'center'} justify={'space-between'} gap={2}>
                        <Checkbox className={styles.checkBoxLabel} defaultChecked>Select All</Checkbox>
                        <Menu>
                            <MenuButton className={styles.allInboxes} backgroundColor={'#ffffff'}
                                        borderRadius={'50px'} border={'1px solid rgba(8, 22, 47, 0.14)'}
                                        fontSize={'14px'} lineHeight={'1'} height={'auto'} as={Button}
                                        rightIcon={<ChevronDownIcon/>}> All Inboxes </MenuButton>
                            <MenuList>
                                <MenuItem>Download</MenuItem>
                                <MenuItem>Create a Copy</MenuItem>
                                <MenuItem>Mark as Draft</MenuItem>
                                <MenuItem>Delete</MenuItem>
                                <MenuItem>Attend a Workshop</MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>
                    {isLoading && <SpinnerUI/>}

                    <Flex direction={'column'} gap={1} className={`${styles.mailList} ${styles.projectThreadList}`}>
                        {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
                            <div onClick={() => handleClick(item) } key={index}
                                 className={`${selectedThread && selectedThread.id === item.id ? styles.selectedThread : ''}`}>
                                <div
                                    className={`${styles.mailDetails} ${(item.mailboxes || []).includes('UNREAD') ? '' : styles.readThread}`}>
                                    <Flex align={"center"} justify={'space-between'} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> {item.from || 'Anonymous'}
                                        </Flex>
                                        <div className={styles2.receiveTime}>
                                            <Time time={item.latestMessage} isShowFullTime={false}/>
                                        </div>
                                    </Flex>
                                    <div className={styles.mailMessage}>
                                        {item.subject || "(no subject)"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Flex>
                </Flex>
            </GridItem>
        </>
    )
}
