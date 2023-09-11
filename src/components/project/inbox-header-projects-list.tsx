import {Flex, Text, Image, Button} from "@chakra-ui/react";
import {DisneyDIcon, FolderIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project} from "@/models";
import Router from "next/router";

export function InboxHeaderProjectsList() {
    const {projects, isLoading} = useSelector((state: StateType) => state.projects);
    const [projectData, setProjectData] = useState<Project[]>([]);
    const [projectDataLength, setProjectDataLength] = useState<Project[]>([]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            let favoriteData = projects.filter((item: Project) => item.projectMeta?.favorite);
            setProjectData(favoriteData.slice(0, 5))
            setProjectDataLength(favoriteData)
        }
    }, [projects]);

    const changePage = () => {
        Router.push(`/projects?favorite=true`)
    }

    return (
        <>
            <Flex padding={'16px 40px 15px'} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'} gap={3}
                  overflowX={'auto'}>
                {projectData && !!projectData.length && (projectData || []).map((project: Project, index: number) => (
                    <Button onClick={() => Router.push(`/projects/${project.id}`)}
                            key={index} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                            border={'1px solid #F3F4F6'} h={'fit-content'}
                            borderRadius={'8px'} padding={'7px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={'disney-icon'} position={'relative'} align={'center'} justify={'center'}
                              borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'}>
                            <DisneyDIcon/>
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
                {!isLoading &&
                <Button alignItems={'center'} gap={2} textAlign={'left'} backgroundColor={'#FFFFFF'}
                        onClick={() => changePage()} padding={'7px'} minWidth={'216px'}
                        border={'1px solid #F3F4F6'} borderRadius={'8px'} h={'fit-content'}
                        maxWidth={'216px'}>
                    <div className={'folder-icon'}>
                        <FolderIcon/>
                    </div>

                    <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px'
                          color={'#374151'} flex={'1'}>Show all
                        projects {projectDataLength.length > 5 && `(${projectDataLength.length - projectData.length})`}</Text>
                </Button>
                }

            </Flex>
        </>
    )
}
