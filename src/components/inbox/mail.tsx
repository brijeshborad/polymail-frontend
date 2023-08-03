import styles from "@/styles/Inbox.module.css";
import styles2 from "@/styles/common.module.css";
import {Box, Flex, Heading, Text, Input, Button, Tooltip} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, InfoOutlineIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {Time} from "@/components";
import {ArchiveIcon, FolderIcon, TrashIcon, TimeSnoozeIcon, FileIcon, LinkIcon, TextIcon, EmojiIcon} from "@/icons";
import Image from "next/image";
import {Chip} from "@/components/chip";
import {MailTabProps, StateType} from "@/types";
import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getAllMessages} from "@/redux/messages/action-reducer";
import {Message} from "@/models";

export function Mail(props: MailTabProps) {

    const [content, setContent] = useState<Message>(null);
    const [index, setIndex] = useState<number | null>(null);
    const {messages, error} = useSelector((state: StateType) => state.messages);

    const dispatch = useDispatch();

    const getAllThreadMessages = useCallback(() => {
        dispatch(getAllMessages({thread: props.id}));
    }, [dispatch, props.id])

    useEffect(() => {
        if (props.id) {
            setIndex(null)
            getAllThreadMessages();
        }
    }, [props.id, getAllThreadMessages])

    useEffect(() => {
        if (messages && messages.length > 0) {
            setIndex(val => !val ? messages.length - 1 : val);
        }
    }, [messages])

    useEffect(() => {
        if (index !== null) {
            setContent(messages[index]);
        }
    }, [index, messages])

    const showPreThreads = (type) => {
        if (type === 'up') {
            if (index > 1) {
                setIndex(prevState => prevState - 1);
            }
        } else if (type === 'down') {
            if (messages.length - 1 !== index) {
                setIndex(prevState => prevState + 1);
            }
        }
    }

    return (
        <Box className={styles.mailBox}>
            <Flex justifyContent={'space-between'} flexDir={'column'} height={'100%'}>
                <div>
                    <div>
                        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                              marginBottom={'15'} padding={'12px 20px'}>
                            <Flex alignItems={'center'} gap={2}>
                                <div className={styles.closeIcon} onClick={() => props.show(false)}><CloseIcon/></div>
                                <div className={`${styles.actionIcon} ${index > 1 ? '' : styles.disabled}`}
                                     onClick={() => showPreThreads('up')}><ChevronUpIcon/></div>
                                <div
                                    className={`${styles.actionIcon} ${messages?.length - 1 !== index ? '' : styles.disabled}`}
                                    onClick={() => showPreThreads('down')}><ChevronDownIcon/></div>
                            </Flex>
                            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                                <Button className={styles.addToProject} leftIcon={<FolderIcon/>}>Add to Project <span
                                    className={styles.RightContent}>⌘P</span></Button>
                                <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <ArchiveIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <TrashIcon/>
                                    </div>
                                </Tooltip>
                                <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                                    <div>
                                        <TimeSnoozeIcon/>
                                    </div>
                                </Tooltip>

                            </Flex>
                        </Flex>
                        <Flex alignItems={'center'} wrap={'wrap'} justifyContent={'space-between'} gap={2}
                              padding={'10px 20px'}>
                            <Flex alignItems={'center'}>
                                <Image src={'/image/user.png'} alt={''} width={50} height={50}/>
                                <Flex flexDir={'column'} marginLeft={'5'}>
                                    <Heading as='h4' size='md'>{content?.subject || ''}</Heading>
                                    <Text fontSize='sm'>Michel Eisner to Lee Clow and 4 others</Text>
                                </Flex>
                            </Flex>
                            <div className={styles2.receiveTime}>
                                <Time time={content?.created || ''}/>
                            </div>
                        </Flex>
                    </div>
                    <div className={styles.mailBody}>
                        <Text>
                            {content?.snippet || ''}
                        </Text>
                    </div>
                </div>
                <div className={styles.mailFooter}>
                    <Flex alignItems={'center'} marginBottom={4} className={styles.mailReplay}>
                        <Heading as={'h1'} size={'sm'}>Reply</Heading>
                        <TriangleDownIcon/>
                        <Text fontSize={'sm'}>to Lee Clow @chiat.com and 4 others</Text>
                    </Flex>
                    <Box className={styles.replyBox}>
                        <Flex alignItems={'center'} justifyContent={'space-between'} padding={'8px 10px'}
                              borderBottom={'1px solid rgba(0, 0, 0, 0.2)'}>
                            <Flex alignItems={'center'} wrap={'wrap'} gap={1} className={styles.replyBoxCC}>
                                <Heading as={'h1'} size={'sm'} marginRight={1}>CC:</Heading>
                                <Chip text={'Design Team'} buttonClass={styles.textBlue}/>
                                <Chip text={'John Doe'}/>
                                <Chip text={'Lee Clow'}/>
                            </Flex>
                            <InfoOutlineIcon/>
                        </Flex>
                        <div className={styles.replayMessage}>
                            <Input variant='unstyled'
                                   placeholder='Reply with anything you like or @mention someone to share this thread'/>
                            <Flex align={'flex-end'} justify={"space-between"} gap={2}>
                                <Flex align={'center'} gap={3}>
                                    <FileIcon/>
                                    <LinkIcon/>
                                    <TextIcon/>
                                    <EmojiIcon/>
                                </Flex>
                                <Button className={styles.replyButton} colorScheme='blue'
                                        rightIcon={<ChevronDownIcon/>}>Reply all</Button>
                            </Flex>
                        </div>
                    </Box>
                </div>
            </Flex>
        </Box>
    )
}
