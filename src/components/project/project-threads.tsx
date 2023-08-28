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
import styles1 from "@/styles/Inbox.module.css";

import {ChevronDownIcon} from "@chakra-ui/icons";
import {DisneyIcon} from "@/icons";
import styles2 from "@/styles/common.module.css";
import React, { useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {Thread} from "@/models";
import {Time} from "@/components/common";


export function ProjectThreads() {
    let {selectedProject} = useSelector((state: StateType) => state.projects);
    const {
        threads,
        selectedThread
    } = useSelector((state: StateType) => state.threads);
    const dispatch = useDispatch();


    useEffect(() => {
        if (selectedProject && selectedProject.id) {
            dispatch(getAllThreads({ project: selectedProject.id}));
        }
    }, [dispatch])

    const handleClick = (item: Thread) => {
        console.log('item' , item)
    }
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

                    {threads && threads.length > 0 && threads.map((item: Thread, index: number) => (
                        <div onClick={() => handleClick(item) } key={index}
                             className={`${selectedThread && selectedThread.id === item.id ? styles1.selectedThread : ''}`}>
                            <div
                                className={`${styles.mailDetails} ${(item.mailboxes || []).includes('UNREAD') ? '' : styles1.readThread}`}>
                                <Flex align={"center"} justify={'space-between'}>
                                    <Flex align={"center"} gap={1}>
                                        <Flex align={"center"} className={styles.senderDetails} gap={1}>
                                            <DisneyIcon/> {item.from || 'Anonymous'}
                                        </Flex>
                                    </Flex>
                                    <div className={styles2.receiveTime}>
                                        <Time time={item.latestMessage} isShowFullTime={false}/>
                                    </div>
                                </Flex>
                                <div className={styles.mailMessage}>
                                    {item.subject}
                                </div>
                            </div>
                        </div>
                    ))}
                </Flex>
            </GridItem>
        </>
    )
}
