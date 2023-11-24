import React, {ChangeEvent, useEffect, useState} from "react";
import withAuth from "@/components/auth/withAuth";
import {
    Badge,
    Button,
    Flex,
    Heading, Menu, MenuButton, MenuItem, MenuList,
    Text, useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {DragIcon, LockIcon, StarIcon, MenuIcon} from "@/icons";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {updateProject, updateOptimisticProject, removeProject} from "@/redux/projects/action-reducer";
import Router, {useRouter} from "next/router";
import {Project} from "@/models";
import {POSITION_GAP} from "@/utils/constants";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {commonService, projectService} from "@/services";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import {deleteMemberFromProject} from "@/redux/memberships/action-reducer";
import {getRandomProjectMetaOrder} from "@/utils/common.functions";
import {UsersOnline} from "@/components/common";

function Index() {
    const {isLoading, projects, projectSearchedString} = useSelector((state: StateType) => state.projects);
    const {showCreateProjectModal} = useSelector((state: StateType) => state.commonApis);
    const router = useRouter();
    const dispatch = useDispatch();
    const [isOpenByRoute, setIsOpenByRoute] = useState<boolean>(false);

    const [itemList, setItemList] = useState<Project[]>([]);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [projectData, setProjectData] = useState<Project | null>(null);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [actionType, setActionType] = useState<string>('');


    useEffect(() => {
        if (projects && projects.length > 0) {
            let sortedList = projectService.sortProjects(projects);
            if (projectSearchedString) {
                sortedList = sortedList.filter((item: Project) => item.name?.toLowerCase().includes(projectSearchedString.toLowerCase().trim()));
            }
            if (router.query.favorite === 'true') {
                let favoriteData = sortedList.filter((item: Project) => item.projectMeta?.favorite);
                setItemList(favoriteData)
            } else {
                setItemList(sortedList)
            }
        }
    }, [router.query.favorite, projects, projectSearchedString])


    const handleDragStart = (index: number, e: ChangeEvent | any) => {
        e.dataTransfer.setData('index', index);
    };


    const handleDragOver = (e: ChangeEvent | any) => {
        e.preventDefault();
    };

    function getOrder(item: any) {
        return item?.projectMeta?.order || getRandomProjectMetaOrder();
    }


    const nextPosition = (items: Project[], index: number | undefined, excludedId: string | undefined) => {
        const filteredItems = excludedId === undefined ? items : items.filter((item) => item.id !== excludedId);

        if (index === undefined) {
            const lastItem = filteredItems[filteredItems.length - 1];

            return (lastItem ? getOrder(lastItem) : 0) + POSITION_GAP;
        }

        const prevItem = filteredItems[index - 1];
        const nextItem = filteredItems[index];

        const prevPosition = prevItem ? getOrder(prevItem) : 0;

        if (!nextItem) {
            return prevPosition + POSITION_GAP;
        }
        return (prevPosition + getOrder(nextItem)) / 2;
    };


    const handleDrop = (e: ChangeEvent | any, dropIndex: number) => {
        const draggedIndex = +e.dataTransfer.getData('index');
        const draggedItem = itemList[draggedIndex];
        // return e.dataTransfer.setData('index', prevPosition + (nextItem.position - prevPosition) / 2);

        let body = {
            order: nextPosition(itemList, dropIndex, draggedItem.id)
        }
        dispatch(updateProject({body: {id: draggedItem.id!, body: body}}))

        const newItems = (itemList || []).filter((_, index) => index !== draggedIndex);
        newItems.splice(dropIndex, 0, draggedItem);

        setItemList(newItems);
    };


    const toggleProjectFavorite = (item: Project) => {
        let isProjectFavorite: boolean = !item.projectMeta?.favorite;
        if (item && item.id) {
            let body = {
                do: {
                    favorite: isProjectFavorite,
                    order: item.projectMeta?.order
                },
                undo: {
                    favorite: !isProjectFavorite,
                    order: item.projectMeta?.order
                },
                id: item.id
            }
            dispatch(updateOptimisticProject({body: body}))
        }
    }


    useEffect(() => {
        const routePaths = router.pathname.split('/');
        if (routePaths.includes('create-project')) {
            setIsOpenByRoute(true);
            commonService.toggleCreateProjectModel(true, true);
        }
    }, [dispatch, router.pathname])


    useEffect(() => {
        if (!showCreateProjectModal && isOpenByRoute) {
            setIsOpenByRoute(false);
            Router.replace('/projects', undefined, {shallow: true});
        }
    }, [showCreateProjectModal, isOpenByRoute])

    const openModel = (item: any, type: string) => {
        setProjectData(item)
        setActionType(type)
        onDeleteModalOpen()
    }

    const removeProjectData = () => {
        if (actionType === 'leave') {
            if (selectedAccount) {
                if (projectData && projectData.id && selectedAccount?.id) {
                    dispatch(deleteMemberFromProject({
                        body: {id: projectData.id, accountId: selectedAccount.id}, toaster: {
                            success: {
                                desc: 'Member is removed form project successfully',
                                title: 'Remove member form project',
                                type: 'success'
                            }
                        },
                        afterSuccessAction: () => {
                            let project = (itemList || []).filter((item: Project) => item.id !== projectData.id);
                            setItemList(project);
                        }
                    }));
                }
            }
        } else {
            if (projectData && projectData.id) {
                dispatch(removeProject({
                        body: {
                            projectId: projectData.id
                        },
                        toaster: {
                            success: {
                                desc: 'Project removed successfully',
                                title: 'Success',
                                type: 'success'
                            }
                        },
                        afterSuccessAction: () => {
                            let {projects} = projectService.getProjectState();
                            let finalProjects = [...(projects || [])];
                            let removeProjectIndex = finalProjects.findIndex((item: Project) => item.id === projectData.id);
                            if (removeProjectIndex !== -1) {
                                finalProjects.splice(removeProjectIndex, 1);
                            }
                            projectService.setProjectState({projects: finalProjects});
                        }
                    }
                ))
            }
        }
        onDeleteModalClose()
    }

    return (
        <>
            <Flex maxH={"calc(100vh - 65px)"} overflow={"auto"}>
                <Flex direction={'column'} gap={7} maxWidth={'895px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'}
                      h={'100%'}
                      className={styles.projectListPage}>
                    <Flex align={'center'} justify={'space-between'}>
                        <Flex align={'center'}>
                            <Flex align={'center'}>
                                <Heading as='h4' fontSize={'24px'} lineHeight={'29px'} fontWeight={600} color={'#374151'}>Projects</Heading>
                                <Badge backgroundColor={'#EBF2FF'} fontSize={'14px'} lineHeight={'16px'} color={'#0556FF'}
                                       padding={'3px 6px'} borderRadius={'4px'} display={'block'}
                                       marginLeft={2}>{itemList && itemList.length}</Badge>
                            </Flex>
                            <Text fontSize='xs' mb={0} pl={3} ml={3} borderLeft={'1px solid #D1D5DB'} color={'#6B7280'} lineHeight={1}>by priority</Text>
                        </Flex>
                        <Button className={styles.createProjectButton} color={'#ffffff'} backgroundColor={'#1F2937'}
                                onClick={() => {
                                    Router.replace('/projects/create-project');
                                }}
                                h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'}
                                padding={'10px 12px'} lineHeight={'16px'}>Create Project</Button>
                    </Flex>
                    {isLoading && <Flex direction="column" gap={2} mt={5}>
                        <SkeletonLoader skeletonLength={10}/>
                    </Flex>}
                    <Flex align={'center'} direction={'column'} gap={2}>
                        {itemList && itemList.length > 0 && itemList.map((project: Project, index: number) => (
                            <Flex key={index + 1} width={'100%'} className={styles.projects} cursor={'pointer'}
                                  align={'center'}
                                  gap={2} paddingRight={'15px'} backgroundColor={'#ffffff'}
                                  borderRadius={8}
                                  border={'1px solid #E5E7EB'}
                            >
                                <Flex justify={'space-between'} align={'center'} gap={3} padding={'15px 0 15px 15px'}
                                      width={'100%'}
                                      onClick={() => router.push(`/projects/${project.id}`)}
                                      onDrop={(e) => handleDrop(e, index)}
                                      draggable
                                      onDragStart={(e) => handleDragStart(index, e)}
                                      onDragOver={handleDragOver}>
                                    <Flex align={'center'} gap={2}>
                                        <Flex className={styles.dragIcon} cursor={'grab'}> <DragIcon/> </Flex>
                                        <div className={styles.projectIcon}>
                                            {project?.emoji ? project.emoji :
                                                <Image src="/image/handcraft.png" width="24" height="24" alt=""/>}
                                        </div>
                                        <Text fontSize='sm' lineHeight={'16px'} color={'#0A101D'}
                                              fontWeight={'500'} noOfLines={1}>{project.name}</Text>
                                        <Badge textTransform={'none'} backgroundColor={'#F3F4F6'} fontSize={'11px'}
                                               fontWeight={400}
                                               color={'#374151'} lineHeight={'1'} borderRadius={50}
                                               padding={'3px 6px'}>{project.numThreads} thread{(project.numThreads || 0) !== 1 ? 's' : ''}</Badge>
                                        <Badge backgroundColor={'#EBF2FF'} fontSize={'11px'} color={'#0556FF'} fontWeight={400}
                                       lineHeight={'1'} borderRadius={50} padding={'4px 6px'} textTransform={'none'}>2 updates</Badge>
                                    </Flex>

                                    <Flex align={'center'} gap={2}>
                                        <Flex className={styles.memberImages}>
                                            <UsersOnline type={'projects'} itemId={project.id!}
                                                         className={styles.memberPhoto}/>
                                        </Flex>
                                        {project.scope === "private" && (
                                            <Flex align={'center'} justify={'center'} h={'20px'} w={'20px'}
                                                  borderRadius={50} className={styles.projectListIcon}
                                                  backgroundColor={'#F3F4F6'}>
                                                <LockIcon/>
                                            </Flex>
                                        )}
                                        <Flex align={'center'} justify={'center'} h={'20px'} w={'20px'}
                                              borderRadius={50}
                                              className={`${styles.projectListIcon} ${project.projectMeta?.favorite ? styles.projectFillStar : ''}`}
                                              backgroundColor={'#F3F4F6'} onClick={(e) => {
                                            e.stopPropagation();
                                            toggleProjectFavorite(project)
                                        }}>
                                            <StarIcon/>
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <Menu isLazy>
                                    <MenuButton className={styles.projectListDropDownButton} borderRadius={4}
                                                backgroundColor={'#FFFFFF'} h={'20px'} fontSize={12} padding={0}
                                                minW={5} as={Button}>
                                        <MenuIcon/>
                                    </MenuButton>
                                    <MenuList minW={'126px'} className={'drop-down-list'}>
                                        <MenuItem onClick={() => projectService.markProjectAsRead(project.id!)}>Mark as
                                            read</MenuItem>
                                        <MenuItem
                                            onClick={() => commonService.toggleEditProjectModel(true, false, project)}>Edit
                                            project</MenuItem>
                                        <MenuItem onClick={() => openModel(project, 'leave')}>Leave project</MenuItem>
                                        {(project.projectMeta?.userId === selectedAccount?.userId) &&
                                        <MenuItem className={'delete-button'}
                                                  onClick={() => openModel(project, 'delete')}>Delete
                                            project</MenuItem>}
                                    </MenuList>
                                </Menu>

                            </Flex>
                        ))}

                    </Flex>
                </Flex>
            </Flex>

            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeProjectData}
                               modelTitle={`Are you sure you want to ${actionType === 'delete' ? 'remove' : 'leave'} project?`}/>
        </>
    )
}

export default withAuth(Index);
