import {Flex, Text, Image, Button, useDisclosure} from "@chakra-ui/react";
import {DisneyDIcon, FolderIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project} from "@/models";
import Router from "next/router";
import {PlusIcon} from "@/icons/plus.icon";

const CreateNewProjectModal = dynamic(() => import("@/components/project/create-new-project").then(mod => mod.default));
import {updateThreadState} from "@/redux/threads/action-reducer";
import {updateMessageState} from "@/redux/messages/action-reducer";
import dynamic from "next/dynamic";

export function InboxHeaderProjectsList(props: { size: number }) {
    const {projects, isLoading} = useSelector((state: StateType) => state.projects);
    const [projectData, setProjectData] = useState<Project[]>([]);
    const [projectDataLength, setProjectDataLength] = useState<Project[]>([]);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const dispatch = useDispatch();
    const projectButtonRef = React.useRef<HTMLDivElement | null | any>(null);
    const [maxSize, setMaxSize] = useState<number>(5);

    useEffect(() => {
        if (projects && projects.length > 0) {
            setProjectData(projects.slice(0, maxSize));
            setProjectDataLength(projects)
        }
    }, [projects, maxSize]);

    useEffect(() => {
        setMaxSize(Math.floor(props.size / 216) - 2)
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
                tabValue: 'reset',
                selectedThread: null,
            }),
        );
        dispatch(updateMessageState({selectedMessage: null}));
    }

    return (
        <>
            <>
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
                            <div className={'member-photo'}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                        </Flex>
                    </Button>

                ))
                }

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
                {!isLoading && projectData && projectData.length < maxSize &&
                <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                        onClick={() => {
                            onOpen()
                        }} padding={'7px'} minWidth={'216px'}
                        border={'1px dashed #E5E7EB'} borderRadius={'8px'} h={'fit-content'}
                        maxWidth={'216px'} className={'create-project-button'}>
                    <div className={'folder-icon'}>
                        <PlusIcon/>
                    </div>

                    <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                          color={'#374151'} flex={'1'}>{isLoading}Create Project</Text>
                </Button>
                }


            </>

            <CreateNewProjectModal onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>
        </>
    )
}
