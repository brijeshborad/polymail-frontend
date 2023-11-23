import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {UserProjectOnlineStatus} from "@/models";
import Tooltip from "@/components/common/Tooltip";
import {Image, Text} from "@chakra-ui/react";
import React, {useState} from "react";

type UsersOnlineType = { type: 'projects' | 'threads', itemId: string, className?: string, imageSize?: string, showTotal?: boolean }

export function UsersOnline({type, itemId, className, imageSize, showTotal}: UsersOnlineType) {
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis);
    const [maxShowingMembers, setMaxShowingMembers] = useState<number>(5);
    return (
        <>
            {
                (onlineUsers && onlineUsers[type][itemId] || [])
                    .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, maxShowingMembers)
                    .map((item: UserProjectOnlineStatus, index: number) => (
                            <Tooltip label={item.name || ''} placement='bottom' key={index}>
                                <div className={className || 'member-photo'}
                                     style={{background: '#000', border: `2px solid #${item.color}`}}>
                                    {item.avatar &&
                                    <Image src={item.avatar} width={imageSize || '24'} height={imageSize || '24'}
                                           alt=""/>}
                                </div>
                            </Tooltip>
                        )
                    )
            }
            {showTotal &&
            <Text fontSize={'sm'} textDecoration={'underline'} cursor={'pointer'}
                  onClick={() => setMaxShowingMembers(maxShowingMembers + 5)}>
                {onlineUsers && (onlineUsers[type][itemId] || []).length > maxShowingMembers ? `+${(onlineUsers[type][itemId] || []).length - maxShowingMembers}more` : ''}
            </Text>
            }
        </>
    )
}
