import {Flex, Text, Image, Button} from "@chakra-ui/react";
import {DisneyDIcon, FolderIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project, Thread} from "@/models";
import Router from "next/router";
import {PlusIcon} from "@/icons/plus.icon";
import {updateThreadState} from "@/redux/threads/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {updateLastMessage} from "@/redux/socket/action-reducer";
import dayjs from "dayjs";
import {debounceInterval} from "@/utils/common.functions";

let displayProjectsData: Project[] = [];

export function InboxHeaderProjectsList(props: { size: number }) {
    const {projects, isLoading} = useSelector((state: StateType) => state.projects);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {threads} = useSelector((state: StateType) => state.threads);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const [projectData, setProjectData] = useState<Project[]>([]);
    const [projectDataLength, setProjectDataLength] = useState<Project[]>([]);
    const dispatch = useDispatch();
    const projectButtonRef = React.useRef<HTMLDivElement | null | any>(null);
    const [maxSize, setMaxSize] = useState<number>(5);

    useEffect(() => {
        if (newMessage) {
            dispatch(updateLastMessage(null));
            if (newMessage.name === 'Activity') {
                let displayedProjects = [...displayProjectsData];
                if (userDetails && userDetails.id !== newMessage.data.userId) {
                    let findThread: Thread | any = (threads || []).find((item: Thread) => item.id === newMessage.data.threadId);
                    displayedProjects = displayedProjects.map((projectItem: Project) => {
                        let updateUserData = false;
                        let finalItem: Project = {...projectItem};
                        if (!finalItem.userProjectOnlineStatus) {
                            finalItem.userProjectOnlineStatus = [];
                        }
                        if (newMessage.data.type === 'ViewingThread') {
                            if (findThread && (findThread.projects || []).some((value: Project) => value.id === projectItem!.id)) {
                                updateUserData = true;
                            }
                        }
                        if (newMessage.data.type === 'ViewingProject') {
                            if (projectItem.id === newMessage.data.projectId) {
                                updateUserData = true;
                            }
                        }

                        if (updateUserData && newMessage.data.userId) {
                            let userAlreadyExists = finalItem.userProjectOnlineStatus.findIndex((item) => item.userId === newMessage.data.userId);
                            if (userAlreadyExists !== -1) {
                                finalItem.userProjectOnlineStatus[userAlreadyExists].isOnline = true;
                                finalItem.userProjectOnlineStatus[userAlreadyExists].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a');
                            } else {
                                finalItem.userProjectOnlineStatus.push({
                                    userId: newMessage.data.userId,
                                    isOnline: true,
                                    lastOnlineStatusCheck: new Date(),
                                    avatar: newMessage.data.avatar,
                                    color: Math.floor(Math.random()*16777215).toString(16),
                                    name: newMessage.data.name
                                })
                            }
                        }
                        return {...finalItem};
                    })
                    setProjectData(displayedProjects);
                }
            }
        }
    }, [newMessage, dispatch, threads, userDetails]);

    useEffect(() => {
        displayProjectsData = projectData;
    }, [projectData])

    useEffect(() => {
        debounceInterval(() => {
            let displayedProjects = [...displayProjectsData];
            displayedProjects = displayedProjects.map((item: Project) => {
                let finalItem = {...item};
                if (!finalItem.userProjectOnlineStatus) {
                    finalItem.userProjectOnlineStatus = [];
                }
                finalItem.userProjectOnlineStatus = finalItem.userProjectOnlineStatus.map((data) => {
                    let finalData = {...data};
                    if (finalData.isOnline && dayjs(finalData.lastOnlineStatusCheck, 'DD/MM/YYYY hh:mm:ss a').diff(dayjs(), 'seconds') > 10) {
                        finalData.isOnline = false;
                    }
                    return finalData;
                })
                return {...finalItem}
            })
            setProjectData([...displayedProjects]);
        }, 1000 * 10);
    }, [])

    useEffect(() => {
        if (projects && projects.length > 0) {
            setProjectData([...(projects || [])].reverse().slice(0, maxSize));
            setProjectDataLength(projects)
        }
    }, [projects, maxSize]);

    useEffect(() => {
        setMaxSize(Math.floor(props.size / 216) - 3)
    }, [props.size])

    const changePage = () => {
        applyChanges();
        Router.push(`/projects`)
    }

    const gotoProject = (id: string) => {
        applyChanges();
        Router.push(`/projects/${id}`)
    }

    function applyChanges() {
        dispatch(
            updateThreadState({
                threads: [],
                success: false,
                updateSuccess: false,
                selectedThread: null,
                tabValue: ''
            }),
        );
        dispatch(updateMessageState({selectedMessage: null, messages: []}));
    }

    return (
        <>
            <>
                <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                        onClick={() => dispatch(updateCommonState({
                            showCreateProjectModal: true,
                            shouldRedirectOnCreateProject: true
                        }))} padding={'7px'} minWidth={'216px'}
                        border={'1px dashed #E5E7EB'} borderRadius={'8px'} h={'fit-content'}
                        maxWidth={'216px'} className={'create-project-button'}>
                    <div className={'folder-icon'}>
                        <PlusIcon/>
                    </div>

                    <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                          color={'#374151'} flex={'1'}>{isLoading}Create Project</Text>
                </Button>
                {projectData && !!projectData.length && (projectData || []).map((project: Project, index: number) => (
                    <Button onClick={() => gotoProject(project.id!)} ref={projectButtonRef}
                            key={index} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                            border={'1px solid #F3F4F6'} h={'fit-content'}
                            borderRadius={'8px'} padding={'7px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={'disney-icon'} position={'relative'} align={'center'} justify={'center'}
                              borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'}>
                            {project?.emoji ? project.emoji : <DisneyDIcon/>}
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                              color={'#0A101D'} flex={'1'}>{project.name}</Text>
                        <Flex className={'member-images subheader-images'}>
                            {(project.userProjectOnlineStatus || [])
                                .filter(t => t.isOnline).slice(0, 5)
                                .map((item, index) => (
                                        <div className={'member-photo'} title={item.name}
                                             style={{background: '#000', border: `2px solid #${item.color}`}} key={index}>
                                            {item.avatar && <Image src={item.avatar} width="24" height="24"
                                                                   alt=""/>}
                                        </div>
                                    )
                                )
                            }
                        </Flex>
                    </Button>
                ))}

                {projectData && projectData.length >= maxSize &&
                <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                        onClick={() => changePage()} padding={'7px'} minWidth={'216px'}
                        border={'1px solid #F3F4F6'} borderRadius={'8px'} h={'fit-content'}
                        maxWidth={'216px'}>
                    <div className={'folder-icon'}>
                        <FolderIcon/>
                    </div>

                    <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                          color={'#374151'} flex={'1'}>Show all
                        projects {projectDataLength.length > maxSize && `(${projectDataLength.length - projectData.length})`}</Text>
                </Button>
                }
            </>
        </>
    )
}
