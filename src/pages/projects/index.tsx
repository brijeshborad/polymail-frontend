import React, {ChangeEvent, useEffect, useState} from "react";
import withAuth from "@/components/auth/withAuth";
import {
    Badge,
    Button,
    Flex,
    Heading,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {BlueStarIcon, DragIcon, LockIcon, StarIcon} from "@/icons";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getAllProjects, updateProject} from "@/redux/projects/action-reducer";
import Router, {useRouter} from "next/router";
import {Project} from "@/models";
import {SpinnerUI} from "@/components/common";
import CreateNewProjectModal from "@/components/project/create-new-project";
import {Simulate} from "react-dom/test-utils";
import {POSITION_GAP} from "@/utils/constants";


function Index() {
    const {isLoading, projects} = useSelector((state: StateType) => state.projects);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();
    const dispatch = useDispatch();
    const [isOpenByRoute, setIsOpenByRoute] = useState<boolean>(false);
    // const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    // const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    // const [projectName, setProjectName] = useState<string>('');

    const [itemList, setItemList] = useState<Project[]>([]);

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch])

    useEffect(() => {
        if (projects && projects.length > 0) {

            const sortedList = [...projects].sort((a: Project, b: Project) => (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0));
            if (router.query.favorite === 'true') {
                let favoriteData = sortedList.filter((item: Project) => item.projectMeta?.favorite);
                setItemList(favoriteData)
            } else {
                setItemList(sortedList)
            }
        }
    }, [router.query.favorite, projects])


    const handleDragStart = (index: number, e: ChangeEvent | any) => {
        e.dataTransfer.setData('index', index);
    };

    const handleDragOver = (e: ChangeEvent | any) => {
        e.preventDefault();
    };


    const nextPosition = (items: Project[], index: number | undefined, excludedId: string | undefined) => {
        const filteredItems = excludedId === undefined ? items : items.filter((item) => item.id !== excludedId);

        if (index === undefined) {
            const lastItem = filteredItems[filteredItems.length - 1];

            return (lastItem ? lastItem.projectMeta?.order || 0 : 0) + POSITION_GAP;
        }

        const prevItem = filteredItems[index - 1];
        const nextItem = filteredItems[index];

        const prevPosition = prevItem ? prevItem.projectMeta?.order || 0 : 0;

        if (!nextItem) {
            return prevPosition + POSITION_GAP;
        }

        return prevPosition + (nextItem.projectMeta?.order || 0 - prevPosition) / 2;
    };


    const handleDrop = (e: ChangeEvent | any, dropIndex: number) => {
        const draggedIndex = +e.dataTransfer.getData('index');
        const draggedItem = itemList[draggedIndex];
        // return e.dataTransfer.setData('index', prevPosition + (nextItem.position - prevPosition) / 2);

        let body = {
            order: nextPosition(itemList, dropIndex, draggedItem.id)
        }
        dispatch(updateProject({id: draggedItem.id!, body}))

        const newItems = (itemList || []).filter((_, index) => index !== draggedIndex);
        newItems.splice(dropIndex, 0, draggedItem);

        setItemList(newItems);
    };

    const makeProjectFavorite = (item: Project, isProjectFavorite: boolean) => {
        if (item && item.id) {
            let body = {
                favorite: isProjectFavorite
            }
            dispatch(updateProject({id: item.id, body}))
        }
    }

    useEffect(() => {
        const routePaths = router.pathname.split('/');
        if (routePaths.includes('create-project')) {
            setIsOpenByRoute(true);
            onOpen()
        }
    }, [onOpen, router.pathname])

    useEffect(() => {
        if (!isOpen && isOpenByRoute) {
            setIsOpenByRoute(false);
            Router.replace('/projects', undefined, {shallow: true});
        }
    }, [isOpen, isOpenByRoute])

    return (
        <>
            <Flex direction={'column'} gap={7} maxWidth={'935px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'}
                  className={styles.projectListPage}>
                <Flex align={'center'} justify={'space-between'}>
                    <Heading as='h4' fontSize={'24px'} fontWeight={600} color={'#08162F'}>Projects <Badge
                        backgroundColor={'rgba(8, 22, 47, 0.04)'} fontSize={'14px'} color={'#08162F'}
                        padding={'3px 6px'}>{itemList && itemList.length}</Badge></Heading>
                    <Button className={styles.createProjectButton} color={'#ffffff'} backgroundColor={'#000000'}
                            onClick={() => { Router.replace('/projects/create-project'); onOpen() }}
                            h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'} padding={'10px 20px'}>Create
                        Project</Button>
                </Flex>
                {isLoading && <SpinnerUI/>}
                <Flex align={'center'} direction={'column'} gap={3}>
                    {itemList && itemList.length > 0 && itemList.map((project: Project, index: number) => (
                        <Flex key={index + 1} width={'100%'} className={styles.projects} cursor={'pointer'}
                              align={'center'}
                              justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8}
                              draggable
                              onDragStart={(e) => handleDragStart(index, e)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              border={'1px solid rgba(8, 22, 47, 0.14)'}
                              onClick={() => router.push(`/projects/${project.id}`)}
                        >

                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'}>{project.name}</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'}
                                       color={'rgba(8, 22, 47, 0.7)'} lineHeight={'1'} borderRadius={50}
                                       padding={'4px 6px'}>{project.numThreads} thread(s)</Badge>
                                {/*<Badge backgroundColor={'rgba(0, 0, 0, 0.03)'} fontSize={'12px'} color={'#000000'}
                                       lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>*/}
                            </Flex>

                            <Flex align={'center'} gap={2}>
                                <Flex className={styles.memberImages}>
                                    <div className={styles.memberPhoto}>
                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                    </div>
                                    <div className={styles.memberPhoto}>
                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                    </div>
                                    <div className={styles.memberPhoto}>
                                        6
                                    </div>
                                </Flex>
                                {project.scope === "private" && (
                                    <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50}
                                          backgroundColor={'rgba(33, 68, 120, 0.1)'}>
                                        <LockIcon/>
                                    </Flex>
                                )}
                                {project.projectMeta?.favorite ?
                                    <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50}
                                          backgroundColor={'rgba(8, 22, 47, 0.05)'} onClick={(e) => {
                                        e.stopPropagation();
                                        makeProjectFavorite(project, false)
                                    }}>
                                        <BlueStarIcon/>
                                    </Flex> :
                                    <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50}
                                          backgroundColor={'rgba(33, 68, 120, 0.1)'} onClick={(e) => {
                                        e.stopPropagation();
                                        makeProjectFavorite(project, true)
                                    }}>
                                        <StarIcon/>
                                    </Flex>
                                }
                                <Flex className={styles.dragIcon}>
                                    <DragIcon/>
                                </Flex>
                            </Flex>
                        </Flex>
                    ))}

                </Flex>
            </Flex>

            <CreateNewProjectModal onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>
        </>
    )
}

export default withAuth(Index);
