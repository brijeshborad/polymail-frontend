import {Message as MessageModel, Message} from "@/models";
import {Flex, Text} from "@chakra-ui/react";
import {globalEventService} from "@/services";
import Image from "next/image";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";


export function MessageDraftItems() {
    const {success: draftSuccess, updatedDraft} = useSelector((state: StateType) => state.draft);
    const {messages} = useSelector((state: StateType) => state.messages);

    const [draftMessages, setDraftMessages] = useState<MessageModel[]>([]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            const currentDraftMessages: MessageModel[] = messages.filter((msg: MessageModel) => (msg.mailboxes || []).includes('DRAFT'));
            setDraftMessages([...currentDraftMessages]);
        }
    }, [messages])

    useEffect(() => {
        if (draftSuccess) {
            if (updatedDraft) {
                if (draftMessages && draftMessages[0] && updatedDraft.threadId !== draftMessages[0].threadId) {
                    return;
                }
                let finalMessages = [...(draftMessages || [])]
                let findDraft = finalMessages.findIndex((item: Message) => item.id === updatedDraft.id);
                if (findDraft !== -1) {
                    finalMessages[findDraft] = updatedDraft;
                } else {
                    globalEventService.fireEvent({
                        data: {
                            callBack: (value: string) => {
                                finalMessages.push({
                                    ...updatedDraft,
                                    draftInfo: {...updatedDraft.draftInfo, body: value}
                                });
                                setDraftMessages([...finalMessages]);
                                globalEventService.blankEvent();
                            }
                        }, type: 'richtexteditor.getCurrentData'
                    });
                }
                setDraftMessages([...finalMessages]);
            }
        }
    }, [draftSuccess, updatedDraft, draftMessages])

    return (
        draftMessages && draftMessages.length > 0 && draftMessages.map((message: Message, messageIndex) => {
            if (message.draftInfo?.discardedBy) {
                return null
            }
            return (
                <div key={messageIndex}>
                    <Flex direction={'column'} cursor={'pointer'} mb={3} onClick={() => {
                        globalEventService.fireEvent({data: {draftId: message.id}, type: 'draft.updateIndex'})
                    }} gap={2} padding={4} borderRadius={'10px'} border={'1px dashed #E5E7EB'}>
                        <Flex align={'center'} justify={'space-between'} gap={2}>
                            <Flex align={'center'} gap={2}>
                                <Flex width={'20px'} height={'20px'} borderRadius={'50%'} overflow={'hidden'}>
                                    <div className={'member-photo'}
                                         style={{background: '#000'}}>
                                        {message?.draftInfo?.createdByAvatarURL &&
                                        <Image src={message?.draftInfo?.createdByAvatarURL} width="24" height="24"
                                               alt=""/>}
                                    </div>
                                </Flex>
                                <Text fontSize={'13px'}
                                      color={'#0A101D'}> {message?.draftInfo?.createdBy || ''} </Text>
                            </Flex>
                        </Flex>

                        <Flex>
                            <Text fontSize={'13px'} color={'#6B7280'} noOfLines={1}>
                                {getPlainTextFromHtml(message.draftInfo?.body || '')}
                            </Text>
                        </Flex>
                    </Flex>
                </div>
            )
        })
    )
}
