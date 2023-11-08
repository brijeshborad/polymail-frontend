import {Box, Flex, Text} from '@chakra-ui/react';
import React from 'react';
import {ActivityFeed} from "@/models/activityFeed";
import styles from '@/styles/Home.module.css';
import {Time} from "@/components/common/time";
import Router from "next/router";
import Image from "next/image";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project} from "@/models";
import {Toaster} from "@/components/common/toaster";

interface FeedComponentProps {
    feedData?: ActivityFeed;
    markFeedAsRead?: () => void;
    close?: () => void;
}

export const FeedComponent: React.FC<FeedComponentProps> = ({feedData, markFeedAsRead, close}) => {
    const {projects} = useSelector((state: StateType) => state.projects);
    function allowRouteChangeForProject(projectId: string, feedData: ActivityFeed) {
        let findProject = [...(projects || [])].find((p: Project) => p.id === projectId);
        if (findProject) {
            Router.push(`/projects/${projectId}`);
            if (close) {
                close();
            }
        } else {
            Toaster({
                title: 'You are not a member of this project',
                desc: feedData?.subtitle || '',
                type: 'error'
            })
        }
    }

    return (
        <Box className={`${styles.feedBox} ${feedData?.isRead ? styles.feedBoxRead: ''}`}
             onClick={() => {
                 if (feedData?.projectId) {
                     allowRouteChangeForProject(feedData.projectId, feedData);
                 }
                 markFeedAsRead ? markFeedAsRead() : null
             }}>
            <Flex>
                <Box flex={1}>
                    <Flex align={'center'} mb={'5px'}>
                        <div style={{width: '25px', height: '25px', borderRadius: '50%', overflow: 'hidden', marginRight: '5px', minWidth: '25px'}}>
                            {feedData?.avatar && feedData?.avatar.url ?
                                <Image width="36" height="36" style={{width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'unset'}} src={feedData?.avatar.url} alt=""/> : null}
                        </div>
                        <Text fontSize="13px">
                            {feedData?.username && <b style={{marginRight: '4px'}}>{feedData?.username}</b>}{feedData?.title}
                        </Text>
                    </Flex>
                    <Text display={'flex'} alignItems={'center'} color="#6B7280" fontSize="12px" className={styles.feedSubtitle}>
                        <Time as={'span'} fontSize={'12px'} time={feedData?.created} isShowFullTime={false} showTimeInShortForm={true}/>
                        <span className={styles.feedSubtitleDot}/>
                        {feedData?.subtitle}
                    </Text>
                </Box>
                {/*<Box width="30px" marginLeft="8px" alignItems="center" display="flex">*/}
                {/*    <Flex>*/}
                {/*        {['yellow', 'pink', 'lightGray']?.map(item => (*/}
                {/*            <Box key={item} height="17px" width="17px" borderRadius="100%" border="2px solid #28C07D"*/}
                {/*                 background={item} marginLeft="-8px"></Box>*/}
                {/*        ))}*/}
                {/*    </Flex>*/}
                {/*</Box>*/}
            </Flex>
            {feedData?.body && (
                <Box>
                    <Box borderTop="1px solid #E5E7EB" marginTop="12px" paddingTop="12px" lineHeight="16px">
                        <Text fontSize={'12px'}>
                            {feedData?.body}
                        </Text>
                    </Box>
                    {/*<Box*/}
                    {/*    height="26px"*/}
                    {/*    width="fit-content"*/}
                    {/*    borderRadius="34px"*/}
                    {/*    backgroundColor="white"*/}
                    {/*    border="1px solid #E5E7EB"*/}
                    {/*    display="flex"*/}
                    {/*    justifyContent="center"*/}
                    {/*    alignItems="center"*/}
                    {/*    padding="0px 6px"*/}
                    {/*    marginTop="12px"*/}
                    {/*    cursor="pointer">*/}
                    {/*    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">*/}
                    {/*        <rect x="4" y="3" width="12" height="14" rx="2" fill="#266DF0"/>*/}
                    {/*        <rect x="6" y="6" width="7.2" height="1.2" rx="0.6" fill="white"/>*/}
                    {/*        <rect x="6" y="8.39844" width="3.6" height="1.2" rx="0.6" fill="white"/>*/}
                    {/*        <rect x="6" y="10.8008" width="4.8" height="1.2" rx="0.6" fill="white"/>*/}
                    {/*    </svg>*/}
                    {/*    <Text fontSize="12px" ms="3px">*/}
                    {/*        Annual Report.doc*/}
                    {/*    </Text>*/}
                    {/*</Box>*/}
                </Box>
            )}
        </Box>
    );
};
