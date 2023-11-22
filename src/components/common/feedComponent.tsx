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
        <Box className={`${styles.feedBox} ${feedData?.isRead ? styles.feedBoxRead : ''}`}
             onClick={() => {
                 if (feedData?.projectId) {
                     allowRouteChangeForProject(feedData.projectId, feedData);
                 }
                 markFeedAsRead ? markFeedAsRead() : null
             }}>
            <Flex>
                <Box flex={1}>
                    <Flex align={'center'} mb={'5px'}>
                        <div style={{
                            width: '25px',
                            height: '25px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            marginRight: '5px',
                            minWidth: '25px'
                        }}>
                            {feedData?.avatar && feedData?.avatar.url ?
                                <Image width="36" height="36"
                                       style={{width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'unset'}}
                                       src={feedData?.avatar.url} alt=""/> : null}
                        </div>
                        <Text fontSize="13px">
                            {feedData?.username &&
                            <b style={{marginRight: '4px'}}>{feedData?.username}</b>}{feedData?.title}
                        </Text>
                    </Flex>
                    <Text display={'flex'} alignItems={'center'} color="#6B7280" fontSize="12px"
                          className={styles.feedSubtitle}>
                        <Time as={'span'} fontSize={'12px'} time={feedData?.created} isShowFullTime={false}
                              showTimeInShortForm={true}/>
                        <span className={styles.feedSubtitleDot}/>
                        {feedData?.subtitle}
                    </Text>
                </Box>
            </Flex>
            {feedData?.body && (
                <Box>
                    <Box borderTop="1px solid #E5E7EB" marginTop="12px" paddingTop="12px" lineHeight="16px">
                        <Text fontSize={'12px'}>
                            {feedData?.body}
                        </Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
