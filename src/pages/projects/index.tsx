import React, {ChangeEvent, useEffect, useState} from "react";
import withAuth from "@/components/auth/withAuth";
import {
    Badge,
    Button,
    Flex,
    Heading, Menu, MenuButton, MenuItem, MenuList,
    Text, Tooltip
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {BlueStarIcon, DragIcon, LockIcon, StarIcon, MenuIcon} from "@/icons";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {updateProject, updateOptimisticProject} from "@/redux/projects/action-reducer";
import Router, {useRouter} from "next/router";
import {Project, UserProjectOnlineStatus} from "@/models";
import {POSITION_GAP} from "@/utils/constants";
import {SkeletonLoader} from "@/components/loader-screen/skeleton-loader";
import {updateCommonState} from "@/redux/common-apis/action-reducer";

function Index() {
    const {isLoading, projects, projectSearchedString} = useSelector((state: StateType) => state.projects);
    const {showCreateProjectModal, onlineUsers} = useSelector((state: StateType) => state.commonApis);
    const router = useRouter();
    const dispatch = useDispatch();
    const [isOpenByRoute, setIsOpenByRoute] = useState<boolean>(false);

    const [itemList, setItemList] = useState<Project[]>([]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            let sortedList = [...projects].sort((a: Project, b: Project) => (a.projectMeta?.order || 0) - (b.projectMeta?.order || 0));
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

        return (prevPosition + (nextItem.projectMeta?.order || 0)) / 2;
    };


    const handleDrop = (e: ChangeEvent | any, dropIndex: number) => {
        const draggedIndex = +e.dataTransfer.getData('index');
        const draggedItem = itemList[draggedIndex];
        // return e.dataTransfer.setData('index', prevPosition + (nextItem.position - prevPosition) / 2);

        let body = {
            order: nextPosition(itemList, dropIndex, draggedItem.id)
        }
        dispatch(updateProject({body:{id: draggedItem.id!, body:body}}))

        const newItems = (itemList || []).filter((_, index) => index !== draggedIndex);
        newItems.splice(dropIndex, 0, draggedItem);

        setItemList(newItems);
    };

    const makeProjectFavorite = (item: Project, isProjectFavorite: boolean) => {
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
            dispatch(updateCommonState({showCreateProjectModal: true, shouldRedirectOnCreateProject: true}));
        }
    }, [dispatch, router.pathname])

    useEffect(() => {
        if (!showCreateProjectModal && isOpenByRoute) {
            setIsOpenByRoute(false);
            Router.replace('/projects', undefined, {shallow: true});
        }
    }, [showCreateProjectModal, isOpenByRoute])

    return (
        <>
            <Flex maxH={"calc(100vh - 65px)"} overflow={"auto"}>
                <Flex direction={'column'} gap={7} maxWidth={'895px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'} h={'100%'}
                      className={styles.projectListPage}>
                    <Flex align={'center'} justify={'space-between'}>
                        <Heading as='h4' fontSize={'24px'} lineHeight={'29px'} fontWeight={600} color={'#374151'}>Projects
                            <Badge backgroundColor={'#EBF2FF'} fontSize={'14px'} lineHeight={'16px'} color={'#0556FF'}
                            padding={'3px 6px'} borderRadius={'4px'} marginLeft={2}>{itemList && itemList.length}</Badge></Heading>
                        <Button className={styles.createProjectButton} color={'#ffffff'} backgroundColor={'#1F2937'}
                                onClick={() => { Router.replace('/projects/create-project'); }}
                                h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'}
                                padding={'10px 12px'} lineHeight={'16px'}>Create Project</Button>
                    </Flex>
                    {isLoading &&  <Flex direction="column" gap={2} mt={5}>
                        <SkeletonLoader skeletonLength={10} />
                    </Flex>}
                    <Flex align={'center'} direction={'column'} gap={2}>
                        {itemList && itemList.length > 0 && itemList.map((project: Project, index: number) => (
                            <Flex key={index + 1} width={'100%'} className={styles.projects} cursor={'pointer'}
                                  align={'center'}
                                   gap={2} paddingRight={'15px'} backgroundColor={'#ffffff'}
                                  borderRadius={8}
                                  border={'1px solid #E5E7EB'}
                            >
                                <Flex justify={'space-between'} align={'center'} gap={3} padding={'15px 0 15px 15px'} width={'100%'}
                                      onClick={() => router.push(`/projects/${project.id}`)} onDrop={(e) => handleDrop(e, index)}
                                      draggable
                                      onDragStart={(e) => handleDragStart(index, e)}
                                      onDragOver={handleDragOver}>
                                    <Flex align={'center'} gap={2}>
                                        <Flex className={styles.dragIcon} cursor={'grab'}> <DragIcon/> </Flex>
                                        <div className={styles.projectIcon}>
                                            { project?.emoji ? project.emoji : <Image src="/image/handcraft.png" width="24" height="24" alt=""/> }
                                        </div>
                                        <Text fontSize='sm' lineHeight={'16px'} color={'#0A101D'} fontWeight={'500'}>{project.name}</Text>
                                        <Badge textTransform={'none'} backgroundColor={'#F3F4F6'} fontSize={'11px'} fontWeight={400}
                                               color={'#374151'} lineHeight={'1'} borderRadius={50}
                                               padding={'3px 6px'}>{project.numThreads} thread{(project.numThreads || 0) !== 1 ? 's': ''}</Badge>
                                        {/*<Badge backgroundColor={'rgba(0, 0, 0, 0.03)'} fontSize={'12px'} color={'#000000'}
                                       lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>*/}
                                    </Flex>

                                    <Flex align={'center'} gap={2}>
                                        <Flex className={styles.memberImages}>
                                            {onlineUsers && (onlineUsers['projects'][project.id!] || [])
                                                .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, 5)
                                                .map((item: UserProjectOnlineStatus, index: number) => (
                                                <Tooltip label={item.name} placement='bottom' bg='gray.300' color='black' key={index}>
                                                    <div className={styles.memberPhoto} style={{border: `2px solid #${item.color}`}}>
                                                        {item.avatar && <Image src={item.avatar} width="24" height="24" alt=""/>}
                                                    </div>
                                                </Tooltip>
                                            ))}
                                            {/*<div className={styles.memberPhoto}> +6 </div>*/}
                                        </Flex>
                                        {project.scope === "private" && (
                                            <Flex align={'center'} justify={'center'} h={'20px'} w={'20px'}
                                                  borderRadius={50} className={styles.projectListIcon}
                                                  backgroundColor={'#F3F4F6'}>
                                                <LockIcon/>
                                            </Flex>
                                        )}
                                        {project.projectMeta?.favorite ?
                                            <Flex align={'center'} justify={'center'} h={'20px'} w={'20px'}
                                                  borderRadius={50} className={`${styles.projectListIcon} ${styles.projectFillStar}`}
                                                  backgroundColor={'#F3F4F6'} onClick={(e) => {
                                                e.stopPropagation();
                                                makeProjectFavorite(project, false)
                                            }}>
                                                <BlueStarIcon/>
                                            </Flex> :
                                            <Flex align={'center'} justify={'center'} h={'20px'} w={'20px'}
                                                  borderRadius={50} className={styles.projectListIcon}
                                                  backgroundColor={'#F3F4F6'} onClick={(e) => {
                                                e.stopPropagation();
                                                makeProjectFavorite(project, true)
                                            }}>
                                                <StarIcon/>
                                            </Flex>
                                        }
                                    </Flex>
                                </Flex>
                                <Menu isLazy>
                                    <MenuButton className={styles.projectListDropDownButton} borderRadius={4} backgroundColor={'#FFFFFF'} h={'20px'} fontSize={12} padding={0} minW={5} as={Button}>
                                        <MenuIcon/>
                                    </MenuButton>
                                    <MenuList minW={'126px'} className={'drop-down-list'}>
                                        <MenuItem>Mark as read</MenuItem>
                                        <MenuItem>Edit project</MenuItem>
                                        <MenuItem>Leave project</MenuItem>
                                        <MenuItem className={'delete-button'}>Delete project</MenuItem>
                                    </MenuList>
                                </Menu>

                            </Flex>
                        ))}

                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}

export default withAuth(Index);
