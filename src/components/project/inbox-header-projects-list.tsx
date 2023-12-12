import {Flex, Text, Button} from "@chakra-ui/react";
import {AddEmojiIcon, FolderIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project} from "@/models";
import Router from "next/router";
import {PlusIcon} from "@/icons/plus.icon";
import {commonService, messageService, projectService, threadService} from "@/services";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {getInboxLoadedFirstTime, setInboxLoadedFirstTime} from "@/utils/cache.functions";
import {useWindowSize} from "@/hooks/window-resize.hook";
import {UsersOnline} from "@/components/common";

export function InboxHeaderProjectsList() {
    const {projects} = useSelector((state: StateType) => state.projects);
    const {isLoading} = useSelector((state: StateType) => state.commonApis);
    const {isLoading: threadIsLoading} = useSelector((state: StateType) => state.threads);
    const [projectData, setProjectData] = useState<Project[]>([]);
    const [projectDataLength, setProjectDataLength] = useState<Project[]>([]);
    const projectButtonRef = React.useRef<HTMLDivElement | null | any>(null);
    const [maxSize, setMaxSize] = useState<number>(0);
    const [width] = useWindowSize();
    const [loadedFirstTime, setIsLoadedFirstTime] = useState<boolean>(getInboxLoadedFirstTime());

    useEffect(() => {
        if (projects && projects.length > 0 && maxSize > 0) {
            setProjectData(projectService.sortProjects([...(projects || [])]).slice(0, maxSize));
            setProjectDataLength(projects)
        }
    }, [projects, maxSize]);

    useEffect(() => {
        if (!getInboxLoadedFirstTime()) {
            if (!isLoading && !threadIsLoading) {
                setInboxLoadedFirstTime(true);
                setIsLoadedFirstTime(true);
            }
        }
    }, [isLoading, threadIsLoading]);

    useEffect(() => {
        setMaxSize(Math.floor(width / 216) - 3)
    }, [width])

    const changePage = () => {
        applyChanges();
        Router.push(`/projects`)
    }

    const gotoProject = (id: string) => {
        applyChanges();
        Router.push(`/projects/${id}`)
    }

    function applyChanges() {
        threadService.cancelThreadSearch(false);
        threadService.pageChange();
        messageService.pageChange();
    }

    return (
        <>
            <>
                <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                        onClick={() => commonService.toggleCreateProjectModel(true, true)} padding={'7px'}
                        minWidth={'216px'} _hover={{backgroundColor: 'var(--alias-bg-subtle)'}}
                        style={{borderImageSource: 'url("./image/icon/dashed.svg")', borderImageRepeat: 'round', borderImageSlice: 1.4}}
                        border={'1px dashed #E5E7EB'} borderRadius={'8px'} h={'fit-content'} color={'#0A101D'}
                        maxWidth={'216px'} className={'create-project-button'}>
                    <div className={'folder-icon'}>
                        <PlusIcon/>
                    </div>

                    <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                          color={'#374151'} flex={'1'}>Create Project</Text>
                </Button>
                {(!loadedFirstTime) && <SkeletonLoader height={'36px'} skeletonLength={6} width={'216px'}/>}
                {loadedFirstTime && <>
                    {projectData && !!projectData.length && (projectData || []).map((project: Project, index: number) => (
                        <Button onClick={() => gotoProject(project.id!)} ref={projectButtonRef}
                                className={'header-project-name-button'} color={'#0A101D'}
                                key={index} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                                border={'1px solid #F3F4F6'} h={'fit-content'}
                                _hover={{backgroundColor: 'var(--alias-bg-subtle)'}}
                                borderRadius={'8px'} padding={'7px'} minWidth={'216px'} maxWidth={'216px'}>
                            <Flex className={'disney-icon'} position={'relative'} align={'center'} justify={'center'}
                                  borderRadius={'3px'} h={'20px'} w={'20px'} fontSize={'18px'}>
                                {project?.emoji ? project.emoji : <AddEmojiIcon/>}
                            </Flex>
                            <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                                  color={'#0A101D'} flex={'1'}>{project.name}</Text>
                            <Flex className={'member-images subheader-images'}>
                                <UsersOnline type={'projects'} itemId={project.id!}/>
                            </Flex>
                        </Button>
                    ))}
                    {/*{(projectData && projectData.length >= maxSize && maxSize > 0) &&*/}
                    {/*}*/}
                    <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                            onClick={() => changePage()} padding={'7px'} minWidth={'216px'}
                            _hover={{backgroundColor: 'var(--alias-bg-subtle)'}}
                            border={'1px solid #F3F4F6'} borderRadius={'8px'} h={'fit-content'}
                            className={'header-project-name-button show-all-project'} color={'#0A101D'}
                            maxWidth={'216px'}>
                        <div className={'folder-icon'}>
                            <FolderIcon/>
                        </div>

                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                              color={'#374151'} flex={'1'}>Show all
                            projects {projectDataLength.length > maxSize && `(${projectDataLength.length - projectData.length})`}</Text>
                    </Button>
                </>}
            </>
        </>
    )
}
